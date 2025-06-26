'use client';

import React, { useState } from 'react';
import { DatePicker, ConfigProvider } from 'antd';
import dayjs from 'dayjs';
import 'dayjs/locale/zh-cn';
import ConcentricCircles from './ConcentricCircles';
import Compass from './Compass';
import CompareResultCircle from './CompareResultCircle';
import { getNineStars, getNineKi, compareStars } from './utils';

export default function NinestarsPage() {
  const [selectedDate, setSelectedDate] = useState(dayjs());
  const res = getNineKi(selectedDate.toDate())
  console.log(`📅 ${selectedDate.format('YYYY-MM-DD')}`)
  console.log(
    `年中宮：${res.yearStar}\n` +
    `月中宮：${res.monthStar}\n` +
    `日中宮：${res.dayStar}`
  )
  console.log(getNineStars(res.yearStar))
  console.log(getNineStars(res.monthStar))
  console.log(getNineStars(res.dayStar))
  const yearStars = getNineStars(res.yearStar)
  const monthStars = getNineStars(res.monthStar)
  const dayStars = getNineStars(res.dayStar)
  const compareResults = compareStars(yearStars, monthStars, dayStars)
  console.log(compareResults)

  // 根据用户选择的日期动态计算九星排列
  const circleTexts = {
    outer_texts: [
      // Innermost of the three outer rings (Day) - 日盘
      dayStars,
      // Middle of the three outer rings (Month) - 月盘
      monthStars,
      // Outermost ring (Year) - 年盘
      yearStars,
    ],
  };

  // Yellow, Green, Pink
  const ringColors = ['#fde047', '#a7f3d0', '#f9a8d4'];
  const legendItems = [
    { label: '日', color: ringColors[0] }, // Innermost
    { label: '月', color: ringColors[1] }, // Middle
    { label: '年', color: ringColors[2] }, // Outermost
  ];

  return (
    <ConfigProvider
      theme={{
        token: {
          colorPrimary: '#8b5cf6',
          borderRadius: 8,
        },
      }}
    >
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
        <div className="container mx-auto px-4 py-16">
          <div className="text-center">
            <h1 className="text-6xl font-bold text-white mb-8">Nine Stars</h1>
            <p className="text-xl text-gray-300 mb-12 max-w-2xl mx-auto">
              Welcome to the Nine Stars page. This is a beautiful and modern page design.
            </p>

            {/* Date Selector */}
            <div className="mb-12">
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 border-white/20 inline-block">
                <label className="block text-white text-lg font-semibold mb-3">
                  选择日期 / Select Date
                </label>
                <DatePicker
                  value={selectedDate}
                  onChange={(date) => setSelectedDate(date || dayjs())}
                  size="large"
                  style={{
                    width: 200,
                    backgroundColor: 'rgba(255, 255, 255, 0.2)',
                    border: '1px solid rgba(255, 255, 255, 0.3)',
                    borderRadius: 8,
                    color: '#fff',
                  }}
                  className="custom-date-picker"
                />
                <p className="text-gray-300 text-sm mt-2">
                  已选择: {selectedDate.format('YYYY年MM月DD日')}
                </p>
              </div>
            </div>

            <div className="flex flex-col items-center">
              <div className="flex items-center justify-center space-x-12">
                {/* 主要的九星圆 */}
                <div className="relative flex items-center justify-center" style={{ width: 600, height: 600 }}>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Compass size={580} />
                  </div>
                  <ConcentricCircles
                    size={500}
                    texts={circleTexts}
                    colors={{ outer_texts: ringColors }}
                  />
                </div>

                {/* 比较结果圆 */}
                <CompareResultCircle
                  size={300}
                  results={compareResults}
                  title="九星生克结果"
                />
              </div>

              <div className="mt-8 text-white flex justify-center space-x-6">
                {legendItems.map((item) => (
                  <div key={item.label} className="flex items-center space-x-2">
                    <span
                      className="w-4 h-4 rounded-full"
                      style={{ backgroundColor: item.color }}
                    ></span>
                    <span>{item.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </ConfigProvider>
  );
} 