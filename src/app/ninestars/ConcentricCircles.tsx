import React from 'react';

interface ConcentricCirclesProps {
  size: number;
  texts?: {
    center?: string;
    ring2?: string;
    ring3?: string;
    outer_texts?: (string | null)[][];
  };
  colors?: {
    outer_texts?: (string | undefined)[];
  };
}

const ConcentricCircles: React.FC<ConcentricCirclesProps> = ({ size, texts = {}, colors = {} }) => {
  const { center: centerText, ring2, ring3, outer_texts } = texts;
  const center = size / 2;
  const radii = [
    center * 0.15, // r0
    center * 0.25, // r1
    center * 0.35, // r2
    center * 0.60, // r3
    center * 0.77, // r4
    center * 0.95, // r5
  ];
  const divisions = 8;
  const textFontSize = size / 35;

  // Use the 9th element from outer_texts for center, ring2, and ring3 if available
  // Day (innermost outer ring) -> center
  const finalCenterText = outer_texts?.[0]?.[8] || centerText;
  // Month (middle outer ring) -> ring2
  const finalRing2Text = outer_texts?.[1]?.[8] || ring2;
  // Year (outermost outer ring) -> ring3
  const finalRing3Text = outer_texts?.[2]?.[8] || ring3;

  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="absolute">
        {/* Circles and Lines */}
        <g fill="none" stroke="rgba(255, 255, 255, 0.5)" strokeWidth="1">
          {radii.map((radius, index) => (
            <circle key={`circle-${index}`} cx={center} cy={center} r={radius} />
          ))}
          {Array.from({ length: divisions }).map((_, i) => {
            const angle = (i * 360) / divisions - 90 + 360 / divisions / 2; // Offset lines
            const rad = (angle * Math.PI) / 180;
            const startRadius = radii[2];
            const endRadius = radii[5];
            const x1 = center + startRadius * Math.cos(rad);
            const y1 = center + startRadius * Math.sin(rad);
            const x2 = center + endRadius * Math.cos(rad);
            const y2 = center + endRadius * Math.sin(rad);
            return <line key={`line-${i}`} x1={x1} y1={y1} x2={x2} y2={y2} />;
          })}
        </g>

        {/* Texts */}
        <g fontSize={textFontSize} textAnchor="middle" dominantBaseline="middle">
          {/* Center, Ring2, Ring3 texts with default color */}
          <g fill="rgba(255, 255, 255, 0.9)">
            {finalCenterText && <text x={center} y={center} fill={colors.outer_texts?.[0]}>{finalCenterText}</text>}
            {finalRing2Text && <text x={center} y={center - radii[1] + textFontSize} fill={colors.outer_texts?.[1]}>{finalRing2Text}</text>}
            {finalRing3Text && <text x={center} y={center - radii[2] + textFontSize} fill={colors.outer_texts?.[2]}>{finalRing3Text}</text>}
          </g>

          {/* Outer Segment Texts */}
          {outer_texts?.map((ringTexts, ringIndex) => {
            const textRadius = (radii[ringIndex + 2] + radii[ringIndex + 3]) / 2;
            const color = colors.outer_texts?.[ringIndex] || 'rgba(255, 255, 255, 0.9)';
            return ringTexts.slice(0, divisions).map((text, segmentIndex) => {
              if (!text) return null;
              const angle = (segmentIndex * 360) / divisions - 90; // N, NE, E...
              const rad = (angle * Math.PI) / 180;
              const x = center + textRadius * Math.cos(rad);
              const y = center + textRadius * Math.sin(rad);
              return (
                <text key={`ot-${ringIndex}-${segmentIndex}`} x={x} y={y} fill={color}>
                  {text}
                </text>
              );
            });
          })}
        </g>
      </svg>
    </div>
  );
};

export default ConcentricCircles; 