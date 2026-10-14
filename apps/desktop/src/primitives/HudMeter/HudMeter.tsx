/* @layer renderer-hud @kind component */
import { useId } from 'react';
import { MAX_RADIUS_SHARE } from './HudMeter.constants';
import type { HudMeterProps } from './HudMeter.type';
import { bandRows } from './behavior/band-rows';
import { MeterSheen } from './sub-components/MeterSheen';

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
            <MeterSheen
              rows={rows}
              frame={frame}
              innerW={innerW}
              frameColor={frameColor}
              sheenColor={sheenColor}
              sheenOpacity={sheenOpacity}
            />
          </g>
        </>
      )}
    </svg>
  );
};

export { HudMeter };
