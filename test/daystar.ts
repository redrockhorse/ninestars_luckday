// nineStar.ts
// -------------------------------------------------------------
//  Calculate the central star (中宮星) of the Japanese Nine‑Star‑Ki
//  daily chart (日家九星) for a given civil date.
//
//  ✨  CHANGELOG  — v1.0.1  2025‑06‑25
//  • Corrected the hard‑coded "base 甲子⽇" from 1984‑02‑02 to
//    **1984‑01‑31** (verified Jia‑Zi day). This removes a two‑day
//    offset in the sexagenary cycle calculation.
// -------------------------------------------------------------
//  Requirements
//    • TypeScript ≥5
//    • astronomy‑engine ≥3
//    • dayjs ≥1.11  (+ utc, timezone plugins)
// -------------------------------------------------------------

import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import tz from 'dayjs/plugin/timezone';
import * as Astronomy from 'astronomy-engine';

// ---------------------------------------------------------------------------
//  Day.js initialisation (work in local civil time Asia/Taipei)
// ---------------------------------------------------------------------------

dayjs.extend(utc);
dayjs.extend(tz);
dayjs.tz.setDefault('Asia/Taipei');

// ---------------------------------------------------------------------------
//  TYPES
// ---------------------------------------------------------------------------

export interface NineStarResult {
  /** ISO‑8601 string (local midnight of the requested date) */
  dateISO: string;
  /** 1–9 central star number */
  starNumber: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9;
  /** Japanese star name, e.g. "九紫火星" */
  starName: string;
  /** Half‑year polarity — 阳(升) or 阴(降) */
  halfYear: 'yang' | 'yin';
  /** Reference 甲子⽇ anchoring the current half‑year */
  referenceJiaZiISO: string;
  /** Day offset from the reference Jia‑Zi (0 = itself) */
  delta: number;
}

// ---------------------------------------------------------------------------
//  CONSTANTS & HELPERS
// ---------------------------------------------------------------------------

// 1984‑01‑31 (Asia/Taipei) is a certified 甲子 day and serves as Day‑0
// of the 60‑day sexagenary cycle for our modulo calculation.
const BASE_JIA_ZI = dayjs.tz('1984-01-31 00:00', 'Asia/Taipei');

const STAR_NAMES: Record<number, string> = {
  1: '一白水星',
  2: '二黒土星',
  3: '三碧木星',
  4: '四緑木星',
  5: '五黄土星',
  6: '六白金星',
  7: '七赤金星',
  8: '八白土星',
  9: '九紫火星',
};

/** Whole‑day difference to the base Jia‑Zi */
function daysFromBase(d: dayjs.Dayjs): number {
  return d.diff(BASE_JIA_ZI, 'day');
}

/** Returns true if `d` is a Jia‑Zi day (Ganzhi index 0) */
function isJiaZi(d: dayjs.Dayjs): boolean {
  const mod = ((daysFromBase(d) % 60) + 60) % 60;
  return mod === 0;
}

/** Bidirectional search (≤14 days) for the nearest Jia‑Zi */
function nearestJiaZi(target: dayjs.Dayjs): dayjs.Dayjs {
  for (let off = 0; off <= 14; off++) {
    const before = target.subtract(off, 'day');
    if (isJiaZi(before)) return before.startOf('day');
    const after = target.add(off, 'day');
    if (isJiaZi(after)) return after.startOf('day');
  }
  throw new Error('No Jia‑Zi found within ±14 days — input out of range?');
}

/**
 * Return winter (Dec) or summer (Jun) solstice **local date** for the supplied
 * year. Versions 2.x and 3.x of astronomy‑engine expose different property
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

// ---------------------------------------------------------------------------
//  MAIN API
// ---------------------------------------------------------------------------

/**
 * dailyNineStar — core routine
 * @param input   any Date / ISO / epoch value parsable by Day.js
 * @returns       NineStarResult with star, half‑year, etc.
 */
export function dailyNineStar(input: string | Date | number): NineStarResult {
  const tgt = dayjs(input).tz('Asia/Taipei').startOf('day');
  if (!tgt.isValid()) throw new Error('Invalid date input.');

  // 1) Identify the three anchor Jia‑Zi dates that frame the year cycle
  const year = tgt.year();
  const winterPrevYear = tgt.month() < 6 ? year - 1 : year; // Jan‑Jun needs Dec of prev year
  const refWinterPrev = nearestJiaZi(solstice(winterPrevYear, 'winter'));
  const refSummer     = nearestJiaZi(solstice(year, 'summer'));

  // 2) Determine polarity (阳遁 or 阴遁) and choose reference date
  const inYang = !tgt.isBefore(refWinterPrev) && tgt.isBefore(refSummer);
  const halfYear = inYang ? 'yang' : 'yin';
  const ref = inYang ? refWinterPrev : refSummer;

  // 3) Distance from reference Jia‑Zi
  const delta = tgt.diff(ref, 'day');

  // 4) Star number via modular arithmetic
  const mod9 = ((delta % 9) + 9) % 9; // 0‑8 always positive
  let star = inYang ? 1 + mod9 : 9 - mod9;
  if (star === 0) star = 9;

  return {
    dateISO: tgt.format('YYYY-MM-DD'),
    starNumber: star as NineStarResult['starNumber'],
    starName: STAR_NAMES[star],
    halfYear,
    referenceJiaZiISO: ref.format('YYYY-MM-DD'),
    delta,
  };
}

// ---------------------------------------------------------------------------
//  ▶︎  Example (uncomment when running standalone)
// ---------------------------------------------------------------------------
// console.log(dailyNineStar('2025-02-26'));


