import React from 'react';

interface CompassProps {
  size: number;
}

const Compass: React.FC<CompassProps> = ({ size }) => {
  const directions = [
    { label: '南', angle: 0 },   // Top
    { label: '西南', angle: 45 },
    { label: '西', angle: 90 },
    { label: '西北', angle: 135 },
    { label: '北', angle: 180 },  // Bottom
    { label: '东北', angle: 225 },
    { label: '东', angle: 270 },
    { label: '东南', angle: 315 },
  ];

  const center = size / 2;
  const radius = size / 2 * 0.9;

  return (
    <div className="relative text-white" style={{ width: size, height: size }}>
      {directions.map(({ label, angle }) => {
        const rad = ((angle - 90) * Math.PI) / 180; // Adjust for SVG coordinates
        const x = center + radius * Math.cos(rad);
        const y = center + radius * Math.sin(rad);
        return (
          <div
            key={label}
            className="absolute"
            style={{
              left: `${x}px`,
              top: `${y}px`,
              transform: 'translate(-50%, -50%)',
              fontSize: size / 28,
            }}
          >
            {label}
          </div>
        );
      })}
    </div>
  );
};

export default Compass; 