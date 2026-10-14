/* @layer renderer-hud @kind component */
import { SHEEN_SHARE } from '../HudMeter.constants';
import type { MeterSheenProps } from '../HudMeter.type';

const MeterSheen = ({ rows, frame, innerW, frameColor, sheenColor, sheenOpacity }: MeterSheenProps) => (
  <>
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
  </>
);

export { MeterSheen };
