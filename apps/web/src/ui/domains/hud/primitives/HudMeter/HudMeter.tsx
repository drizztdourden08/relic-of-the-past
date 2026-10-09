/* @layer renderer-hud @kind component */
import { useId } from 'react';
import { MAX_RADIUS_SHARE, SHEEN_SHARE } from './HudMeter.constants';
import type { HudMeterProps, MeterBand } from './HudMeter.type';

const bandRows = (top: number, height: number, count: number, gap: number): MeterBand[] => {
  const h = (height - gap * (count - 1)) / count;
  return Array.from({ length: count }, (_unused, i) => ({ y: top + i * (h + gap), h }));
};

const HudMeter = (props: HudMeterProps) => {
  const {
    width, height, fraction, frame, radius,
    frameColor, fillColor, sheenColor, sheenOpacity, bands = 1, scale,
  } = props;

  const clipId = `meter-bar-${useId().replace(/:/g, '')}`;
  const filled = Math.min(Math.max(fraction, 0), 1);
  const barW = filled <= 0 ? 0 : Math.max(frame * 2 + 1, width * filled);
  const outerRadius = Math.min(radius, barW * MAX_RADIUS_SHARE);
  const innerW = barW - frame * 2;
  const innerH = height - frame * 2;
  const rows = bandRows(frame, innerH, Math.max(1, Math.floor(bands)), frame);

  return (
    <svg
      width={width * scale}
      height={height * scale}
      viewBox={`0 0 ${width} ${height}`}
      style={{ display: 'block' }}
      aria-hidden
    >
      {barW > 0 && (
        <>
          <defs>
            <clipPath id={clipId}>
              <rect
                x={frame} y={frame} width={innerW} height={innerH}
                rx={Math.max(0, outerRadius - frame)}
              />
            </clipPath>
          </defs>

          <rect
            x={frame / 2}
            y={frame / 2}
            width={barW - frame}
            height={height - frame}
            rx={outerRadius}
            fill={fillColor}
            stroke={frameColor}
            strokeWidth={frame}
          />

          <g clipPath={`url(#${clipId})`}>
            {rows.map((band, i) => (
              <g key={band.y}>
                <rect
                  x={frame} y={band.y} width={innerW} height={band.h * SHEEN_SHARE}
                  fill={sheenColor} opacity={sheenOpacity}
                />
                {i < rows.length - 1 && (
                  <rect
                    x={frame} y={band.y + band.h} width={innerW} height={frame}
                    fill={frameColor}
                  />
                )}
              </g>
            ))}
          </g>
        </>
      )}
    </svg>
  );
};

export { HudMeter };
