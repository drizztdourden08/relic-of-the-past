/* @layer renderer-hud @kind component */
import { useId } from 'react';
import {
  HEART_EMPTY, HEART_FILL, HEART_FILL_MS, HEART_HIGHLIGHT_OPACITY, HEART_HIGHLIGHT_PATH,
  HEART_OUTLINE, HEART_OUTLINE_WIDTH, HEART_PATH, HEART_RIM_OPACITY, HEART_RIM_WIDTH,
  HEART_SHADE_OPACITY, HEART_SHADE_PATH, HEART_TILE, HEART_VIEW,
} from './HudHeart.constants';
import type { HudHeartProps } from './HudHeart.type';
import { tintFor } from './behavior/tint-for';

const HudHeart = (props: HudHeartProps) => {
  const { fill, mode, armor = 0, scale } = props;

  const side = HEART_TILE * scale;
  const tint = tintFor(armor);
  const clipId = `heart-fill-${useId().replace(/:/g, '')}`;
  const cut = Math.min(Math.max(fill, 0), 1) * HEART_VIEW;

  return (
    <svg
      width={side}
      height={side}
      viewBox={`0 0 ${HEART_VIEW} ${HEART_VIEW}`}
      style={{ display: 'block' }}
      aria-hidden
    >
      <defs>
        <clipPath id={clipId}>
          <rect
            x={0}
            y={0}
            width={cut}
            height={HEART_VIEW}
            style={mode === 'smooth' ? { transition: `width ${HEART_FILL_MS}ms ease-out` } : undefined}
          />
        </clipPath>
      </defs>

      <path
        d={HEART_PATH}
        fill={HEART_EMPTY}
        stroke={HEART_OUTLINE}
        strokeWidth={HEART_OUTLINE_WIDTH}
        strokeLinejoin="round"
      />

      <g clipPath={`url(#${clipId})`}>
        <path d={HEART_PATH} fill={HEART_FILL} />
        <path d={HEART_SHADE_PATH} fill={tint.shade} opacity={HEART_SHADE_OPACITY} />
      </g>

      <path
        d={HEART_PATH}
        fill="none"
        stroke={tint.rim}
        strokeWidth={HEART_RIM_WIDTH}
        strokeLinejoin="round"
        opacity={HEART_RIM_OPACITY}
      />
      <path d={HEART_HIGHLIGHT_PATH} fill={tint.highlight} opacity={HEART_HIGHLIGHT_OPACITY} />
    </svg>
  );
};

export { HudHeart };
