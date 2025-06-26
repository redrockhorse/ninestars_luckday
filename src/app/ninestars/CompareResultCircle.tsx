import React from 'react';

interface CompareResultCircleProps {
  size: number;
  results: string[];
  title?: string;
}

const CompareResultCircle: React.FC<CompareResultCircleProps> = ({ size, results, title = "比较结果" }) => {
  const center = size / 2;
  const radius = center * 0.8;
  const divisions = 8;
  const textFontSize = size / 25;

  // 定义不同结果类型的颜色
  const getResultColor = (result: string): string => {
    if (result.startsWith('(') && result.endsWith(')')) {
      return '#10b981'; // 绿色 - 三个一样
    } else if (result === 'X') {
      return '#ef4444'; // 红色 - 相克
    } else if (result === 'O') {
      return '#6b7280'; // 灰色 - 全都不一样
    } else if (result === '有两个一样') {
      return '#f59e0b'; // 橙色 - 有两个一样（无关）
    } else {
      return '#3b82f6'; // 蓝色 - 被生的元素
    }
  };

  return (
    <div className="flex flex-col items-center">
      {title && (
        <h3 className="text-white text-lg font-semibold mb-4">{title}</h3>
      )}
      <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="absolute">
          {/* 外圆 */}
          <circle 
            cx={center} 
            cy={center} 
            r={radius} 
            fill="none" 
            stroke="rgba(255, 255, 255, 0.3)" 
            strokeWidth="2"
          />
          
          {/* 分割线 */}
          <g fill="none" stroke="rgba(255, 255, 255, 0.2)" strokeWidth="1">
            {Array.from({ length: divisions }).map((_, i) => {
              const angle = (i * 360) / divisions - 90;
              const rad = (angle * Math.PI) / 180;
              const x1 = center;
              const y1 = center;
              const x2 = center + radius * Math.cos(rad);
              const y2 = center + radius * Math.sin(rad);
              return <line key={`line-${i}`} x1={x1} y1={y1} x2={x2} y2={y2} />;
            })}
          </g>

          {/* 结果文本 */}
          <g fontSize={textFontSize} textAnchor="middle" dominantBaseline="middle">
            {results.slice(0, divisions).map((result, index) => {
              const angle = (index * 360) / divisions - 90;
              const rad = (angle * Math.PI) / 180;
              const textRadius = radius * 0.6;
              const x = center + textRadius * Math.cos(rad);
              const y = center + textRadius * Math.sin(rad);
              const color = getResultColor(result);
              
              return (
                <text key={`result-${index}`} x={x} y={y} fill={color} fontWeight="bold">
                  {result}
                </text>
              );
            })}
          </g>
        </svg>
      </div>
      
      {/* 图例 */}
      <div className="mt-4 text-white text-xs space-y-1">
        <div className="flex items-center space-x-2">
          <span className="w-3 h-3 rounded-full bg-green-500"></span>
          <span>三个一样</span>
        </div>
        <div className="flex items-center space-x-2">
          <span className="w-3 h-3 rounded-full bg-blue-500"></span>
          <span>被生</span>
        </div>
        <div className="flex items-center space-x-2">
          <span className="w-3 h-3 rounded-full bg-orange-500"></span>
          <span>两个一样</span>
        </div>
        <div className="flex items-center space-x-2">
          <span className="w-3 h-3 rounded-full bg-red-500"></span>
          <span>相克</span>
        </div>
        <div className="flex items-center space-x-2">
          <span className="w-3 h-3 rounded-full bg-gray-500"></span>
          <span>全都不一样</span>
        </div>
      </div>
    </div>
  );
};

export default CompareResultCircle; 