/* @layer renderer-hud @kind component */
import { resolveValue } from '@rotp/hud';
import { HudHeart } from '../../primitives/HudHeart';
import { HudMeter } from '../../primitives/HudMeter';
import {
  BAR_FRAME, BAR_HEIGHT, BAR_RADIUS, BAR_WIDTH,
  MAGIC_FRAME_COLOR, MAGIC_GREEN, MAGIC_SHEEN, MAGIC_SHEEN_OPACITY,
} from '../HudMagicBar/HudMagicBar.constants';
import { quantiseHeartFill } from './behavior/quantise-heart-fill';
import type { HudShapeProps } from './HudShape.type';

const HudShape = (props: HudShapeProps) => {
  const { spec, scope, heartMode, scale } = props;
  const fill = resolveValue(spec.fill, scope);

  if (spec.shape === 'heart') {
    const armor = resolveValue(spec.armor ?? 0, scope);
    const drawn = heartMode === 'original' ? quantiseHeartFill(fill) : Math.min(Math.max(fill, 0), 1);
    return <HudHeart fill={drawn} mode={heartMode} armor={armor} scale={scale} />;
  }

  const bands = Math.max(1, Math.round(resolveValue(spec.bands ?? 1, scope)));
  return (
    <HudMeter
      width={BAR_WIDTH} height={BAR_HEIGHT} fraction={fill}
      frame={BAR_FRAME} radius={BAR_RADIUS}
      frameColor={MAGIC_FRAME_COLOR} fillColor={MAGIC_GREEN}
      sheenColor={MAGIC_SHEEN} sheenOpacity={MAGIC_SHEEN_OPACITY}
      bands={bands} scale={scale}
    />
  );
};

export { HudShape };
