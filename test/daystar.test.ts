import { describe, test, expect } from 'vitest';
import { dailyNineStar } from './daystar.js';

describe('dailyNineStar', () => {
  test('should calculate correct star for 2025-02-26', () => {
    const result = dailyNineStar('2025-02-26');
    
    expect(result).toMatchObject({
      dateISO: '2025-02-26',
      starNumber: expect.any(Number),
      starName: expect.any(String),
      halfYear: expect.stringMatching(/^(yang|yin)$/),
      referenceJiaZiISO: expect.stringMatching(/^\d{4}-\d{2}-\d{2}$/),
      delta: expect.any(Number),
    });
    
    // 验证星数在 1-9 范围内
    expect(result.starNumber).toBeGreaterThanOrEqual(1);
    expect(result.starNumber).toBeLessThanOrEqual(9);
    
    // 验证星名格式
    expect(result.starName).toHaveLength(4); // 星名应该是4个字符
    expect(result.starName).toMatch(/^[一二三四五六七八九]/); // 以数字开头
  });

  test('should handle different date formats', () => {
    const date1 = dailyNineStar('2025-06-24');
    const date2 = dailyNineStar(new Date('2025-06-24'));
    const date3 = dailyNineStar(new Date('2025-06-24').getTime());
    console.log(date1)
    
    expect(date1).toEqual(date2);
    expect(date1).toEqual(date3);
  });

  test('should throw error for invalid date', () => {
    expect(() => dailyNineStar('invalid-date')).toThrow('Invalid date input');
  });

  test('should calculate stars for multiple dates', () => {
    const testDates = [
      '2025-01-01',
      '2025-06-15',
      '2025-12-31',
      '2024-02-29', // 闰年
    ];

    testDates.forEach(date => {
      const result = dailyNineStar(date);
      expect(result.dateISO).toBe(date);
      expect(result.starNumber).toBeGreaterThanOrEqual(1);
      expect(result.starNumber).toBeLessThanOrEqual(9);
    });
  });

  test('should have consistent half-year polarity', () => {
    // 测试同一半年内的日期应该有相同的极性
    const winterDates = ['2025-01-15', '2025-02-15', '2025-03-15'];
    const summerDates = ['2025-07-15', '2025-08-15', '2025-09-15'];
    
    const winterResults = winterDates.map(date => dailyNineStar(date));
    const summerResults = summerDates.map(date => dailyNineStar(date));
    
    // 冬季日期应该有相同的极性
    const winterPolarity = winterResults[0].halfYear;
    winterResults.forEach(result => {
      expect(result.halfYear).toBe(winterPolarity);
    });
    
    // 夏季日期应该有相同的极性
    const summerPolarity = summerResults[0].halfYear;
    summerResults.forEach(result => {
      expect(result.halfYear).toBe(summerPolarity);
    });
  });
}); 