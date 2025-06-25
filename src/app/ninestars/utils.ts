// Import solar terms calculation
// Note: These dependencies need to be installed: npm install astronomy-engine dayjs
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
import util from 'util';
import * as Astronomy from 'astronomy-engine';

dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.tz.setDefault('Asia/Taipei');

/**
 * Gets an element from an array using a circular index.
 * Handles positive and negative indices.
 * @param arr The array.
 * @param index The index (can be out of bounds).
 * @returns The element at the circular index.
 */
export function getCircularElement<T>(arr: T[], index: number): T {
    if (arr.length === 0) {
        throw new Error('Array cannot be empty.');
    }
    const len = arr.length;
    // The double modulo is to handle negative indices correctly in JavaScript.
    return arr[((index % len) + len) % len];
}

const NUM_TO_CHAR: { [key: number]: string } = { 1: '一', 2: '二', 3: '三', 4: '四', 5: '五', 6: '六', 7: '七', 8: '八', 9: '九' };
const CHAR_TO_NUM: { [key: string]: number } = { '一': 1, '二': 2, '三': 3, '四': 4, '五': 5, '六': 6, '七': 7, '八': 8, '九': 9 };

/**
 * Rotates an array by a given shift amount, treating it as a circular list.
 * Positive shift rotates to the right, negative to the left.
 * @param arr The array to rotate.
 * @param shift The number of positions to shift.
 * @returns A new, rotated array.
 */
export function rotateArray<T>(arr: T[], shift: number): T[] {
    if (arr.length === 0) {
        return [];
    }
    const len = arr.length;
    return arr.map((_, index) => arr[((index - shift % len) + len) % len]);
}

/**
 * Rotates an array so that the specified element ends up at the last position.
 * @param arr The array to rotate.
 * @param targetElement The element that should be moved to the last position.
 * @returns A new, rotated array with the target element at the end.
 */
export function rotateToPosition<T>(arr: T[], targetElement: T): T[] {
    if (arr.length === 0) {
        return [];
    }

    const targetIndex = arr.indexOf(targetElement);
    if (targetIndex === -1) {
        throw new Error(`Element '${targetElement}' not found in array.`);
    }

    // Calculate how many positions to shift
    // We want the target element to end up at the last position (arr.length - 1)
    const shift = targetIndex - (arr.length - 1);

    return rotateArray(arr, shift);
}

/**
 * Calculates a new nine-star ring based on a base ring and a shift value.
 * Uses the formula: n' = (n - s - 1) mod 9 + 1
 * @param baseRing An array of 9 chinese numerals.
 * @param shift The shift value 's'.
 * @returns A new array with the calculated values as chinese numerals.
 */
export function calculateNewRing(baseRing: string[], shift: number): string[] {
    if (baseRing.length !== 9) {
        throw new Error('Base ring must contain 9 elements.');
    }

    return baseRing.map(char => {
        const n = CHAR_TO_NUM[char];
        if (n === undefined) {
            // Return the original character if it's not a number we can convert
            return char;
        }
        // Formula: n_prime = (n - s - 1) % 9 + 1
        const newValue = n - shift - 1;
        // Handle JS modulo for negative numbers
        const modResult = ((newValue % 9) + 9) % 9;
        const finalValue = modResult + 1;
        return NUM_TO_CHAR[finalValue];
    });
}

/**
 * 九星气学：中宫数字 => 返回今年的九星顺序
 * 方向依次为：南, 西南, 西, 西北, 北, 东北, 东, 东南, 中宫
 * @param {number} center The central star number.
 * @returns {string[]} The nine stars sequence for the given year.
 */
export function getNineStars(center: number): string[] {
    const baseNums = [9, 2, 7, 6, 1, 8, 3, 4, 5];
    const delta = (center - 5 + 9) % 9;
    const shifted = baseNums.map(n => ((n + delta - 1 + 9) % 9) + 1);
    return shifted.map(n => NUM_TO_CHAR[n]);
}

/**
 * ===========================
 * 九星气学：取 年 / 月 / 日 中宫数
 * ===========================
 */

/* --------------------------------------------------
 * 1) 获取当年的 12 个「節」作月界
 *    oddOrders = 1,3,5,7,9,11,13,15,17,19,21,23
 * -------------------------------------------------- */
const JIE_ORDERS = [1, 3, 5, 7, 9, 11, 13, 15, 17, 19, 21, 23] as const;
/** 24 节气平均日 (UTC)－再减 5 天作安全裕量 */
const TERM_SEEDS: [m: number, d: number][] = [
    [11, 16], [0, 0], [0, 13], [0, 29], [1, 14], [2, 0],
    [2, 15], [3, 0], [3, 15], [4, 0], [4, 15], [4, 31],
    [5, 16], [6, 1], [6, 17], [7, 2], [7, 18], [8, 3],
    [8, 18], [9, 3], [9, 18], [10, 3], [10, 18], [11, 3],
];

export function solarTermDate(year: number, order: number): Date {
    /* ---------- 1. 起点：平均日期提前 5 天，取 UTC 正午 ---------- */
    const [m, d] = TERM_SEEDS[order];
    const approxDate = new Date(Date.UTC(year, m, d, 12));   // UTC 12:00
    approxDate.setUTCDate(approxDate.getUTCDate() + 5);
    const time = Astronomy.MakeTime(approxDate);

    /* ---------- 2. 目标黄经 (= 节气度数) ---------- */
    const target = (order * 15 + 270) % 360;                 // 0=冬至=270°

    /* ---------- 3. 先判搜索方向 (+1 / -1) ---------- */
    const lon0 = Astronomy.SunPosition(time).elon;    // 太阳视黄经
    const dir = ((target - lon0 + 360) % 360) < 180 ? +1 : -1;

    /* ---------- 4. 精确搜索 ---------- */
    let hit = Astronomy.SearchSunLongitude(target, time, dir);
    if (!hit) hit = Astronomy.SearchSunLongitude(target, time, -dir); // 极罕见兜底
    if (!hit) return dayjs(approxDate).tz().startOf('day').toDate();  // 仍失败→近似

    /* ---------- 5. 返回台北当地 0:00 的日期对象 ---------- */
    return dayjs(hit.date).tz().startOf('day').toDate();
}


// ---------------------------------------------------------------------------
//  DAY STAR CALCULATION - Based on test/daystar.ts
// ---------------------------------------------------------------------------

// 1984-01-31 (Asia/Taipei) is a certified 甲子 day and serves as Day-0
// of the 60-day sexagenary cycle for our modulo calculation.
const BASE_JIA_ZI = dayjs.tz('1984-01-31 00:00', 'Asia/Taipei');

/** Whole-day difference to the base Jia-Zi */
function daysFromBase(d: dayjs.Dayjs): number {
    return d.diff(BASE_JIA_ZI, 'day');
}

/** Returns true if `d` is a Jia-Zi day (Ganzhi index 0) */
function isJiaZi(d: dayjs.Dayjs): boolean {
    const mod = ((daysFromBase(d) % 60) + 60) % 60;
    return mod === 0;
}

/** Bidirectional search (≤14 days) for the nearest Jia-Zi */
function nearestJiaZi(target: dayjs.Dayjs): dayjs.Dayjs {
    for (let off = 0; off <= 14; off++) {
        const before = target.subtract(off, 'day');
        if (isJiaZi(before)) return before.startOf('day');
        const after = target.add(off, 'day');
        if (isJiaZi(after)) return after.startOf('day');
    }
    throw new Error('No Jia-Zi found within ±14 days — input out of range?');
}

/**
 * Return winter (Dec) or summer (Jun) solstice **local date** for the supplied
 * year. Versions 2.x and 3.x of astronomy-engine expose different property
 * names; we therefore probe a small whitelist.
 */
function solstice(year: number, type: 'winter' | 'summer'): dayjs.Dayjs {
    const seasons: any = Astronomy.Seasons(year);
  
    const altKeys = type === 'winter'
      ? ['DecSol', 'dec_solstice', 'DecSolstice', 'decSolstice']
      : ['JunSol', 'jun_solstice', 'JunSolstice', 'junSolstice'];
  
    const key = altKeys.find(k => seasons[k] != null);
    if (!key) {
      throw new Error('Astronomy.Seasons() — unexpected field names; please verify library version.');
    }
  
    const astroTime = seasons[key];
    return dayjs(astroTime.date).tz('Asia/Taipei').startOf('day');
}

/**
 * Calculate the day star using the correct algorithm from test/daystar.ts
 */
function calculateDayStar(input: Date | string): number {
    const tgt = dayjs(input).tz('Asia/Taipei').startOf('day');
    if (!tgt.isValid()) throw new Error('Invalid date input.');

    // 1) Identify the three anchor Jia-Zi dates that frame the year cycle
    const year = tgt.year();
    const winterPrevYear = tgt.month() < 6 ? year - 1 : year; // Jan-Jun needs Dec of prev year
    const refWinterPrev = nearestJiaZi(solstice(winterPrevYear, 'winter'));
    const refSummer     = nearestJiaZi(solstice(year, 'summer'));

    // 2) Determine polarity (阳遁 or 阴遁) and choose reference date
    const inYang = !tgt.isBefore(refWinterPrev) && tgt.isBefore(refSummer);
    const ref = inYang ? refWinterPrev : refSummer;

    // 3) Distance from reference Jia-Zi
    const delta = tgt.diff(ref, 'day');

    // 4) Star number via modular arithmetic
    const mod9 = ((delta % 9) + 9) % 9; // 0-8 always positive
    let star = inYang ? 1 + mod9 : 9 - mod9;
    if (star === 0) star = 9;

    return star;
}

/**
 * =============================================
 *  日本九星气学：输入完整日期 → 返回 {年, 月, 日} 中宫数
 * =============================================
 */
export type StarResult = { yearStar: number; monthStar: number; dayStar: number };

/* ---------- 共通ユーティリティ ---------- */

const mod9 = (n: number) => ((n % 9) + 9) % 9 || 9;
const ONE_DAY = 86_400_000;

/* ---------- 主函数 ---------- */

export function getNineKi(input: Date | string): StarResult {
    const d = typeof input === 'string' ? new Date(input) : input;
    const y = d.getFullYear();

    /* 年盘 */
    const risshun = new Date(y, 1, 4);
    const yearBase = d < risshun ? y - 1 : y;
    const yearStar = mod9(11 - (yearBase % 9));

    /* 月盘 - 先测试原来的算法 */
    const epoch = new Date(2023, 1, 4); // 2023-02-04 八白
    const months = Math.floor((d.getTime() - epoch.getTime()) / (30.436875 * ONE_DAY));
    const monthStarOriginal = mod9(8 - months);

    /* 日盘 - 使用正确的算法 */
    const dayStar = calculateDayStar(d);

    return { yearStar, monthStar: monthStarOriginal, dayStar };
} 