/* @layer renderer-hud @kind component */
import { HudMeter } from '../../primitives/HudMeter';
import {
  BAR_FRAME, BAR_HEIGHT, BAR_RADIUS, BAR_WIDTH, HALF_MAGIC_BANDS, PLAIN_BANDS,
  MAGIC_FRAME_COLOR, MAGIC_GREEN, MAGIC_MAX, MAGIC_SHEEN, MAGIC_SHEEN_OPACITY,
} from './HudMagicBar.constants';
import type { HudMagicBarProps } from './HudMagicBar.type';

const HudMagicBar = (props: HudMagicBarProps) => {
  const { value, halfMagic, scale } = props;

  const fraction = Math.min(Math.max(value / MAGIC_MAX, 0), 1);
  if (fraction <= 0) return null;

  return (
    <HudMeter
      width={BAR_WIDTH}
      height={BAR_HEIGHT}
      fraction={fraction}
      frame={BAR_FRAME}
      radius={BAR_RADIUS}
      frameColor={MAGIC_FRAME_COLOR}
      fillColor={MAGIC_GREEN}
      sheenColor={MAGIC_SHEEN}
      sheenOpacity={MAGIC_SHEEN_OPACITY}
      bands={halfMagic ? HALF_MAGIC_BANDS : PLAIN_BANDS}
      scale={scale}
    />
  );
};

export { HudMagicBar };
