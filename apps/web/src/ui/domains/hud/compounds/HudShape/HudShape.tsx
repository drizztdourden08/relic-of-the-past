/* @layer renderer-hud @kind component */
/**
 * HudShape draws the two pictures the tree cannot compose from a sprite: a heart
 * and the magic bar. See `shared/types/hud/hud-shape.ts` for why this leaf
 * exists at all, and draws by handing off to the exact primitives the
 * compounds it replaces already used (`HudHeart`, `HudMeter`). Nothing about
 * how either LOOKS changed, only how many of them there are and what feeds
 * their fill is now the document's own repeat/expression machinery instead
 * of a compiled-in loop over the save's health units.
 *
 * ORIGINAL HEART MODE IS QUANTISED HERE, NOT IN THE DOCUMENT. Which of
 * full/half/empty a heart reads is a live per-player SETTING (`heartMode`),
 * not a game-data variable, so it cannot be an expression in the preset
 * itself. `quantiseHeartFill` reproduces the console's own "round the total
 * up to the next quarter heart, then read this heart's share" rule from the
 * CONTINUOUS fraction `fill` alone, using the same arithmetic `HudLife`'s
 * `heartFills` used once for the whole row, restated per heart, which is
 * exact because subtracting a heart's own whole-multiple-of-four offset
 * commutes with rounding up to the next multiple of four either way.
 */
import { resolveValue } from '@shared/hud/data';
import { HudHeart } from '../../primitives/HudHeart';
import { HudMeter } from '../../primitives/HudMeter';
import {
  BAR_FRAME, BAR_HEIGHT, BAR_RADIUS, BAR_WIDTH,
  MAGIC_FRAME_COLOR, MAGIC_GREEN, MAGIC_SHEEN, MAGIC_SHEEN_OPACITY,
} from '../HudMagicBar/HudMagicBar.constants';
import type { HeartMode } from '../../primitives/HudHeart';
import type { HudShapeSpec } from '@shared/types/hud';

interface HudShapeProps {
  spec: HudShapeSpec;
  scope: Readonly<Record<string, number>>;
  /** The console's own heart-quantising rule, or the true fraction. A
   *  per-player setting, unrelated to anything a document can bind. */
  heartMode: HeartMode;
  scale: number;
}

/** Health units to one heart. That is the plan's own unit for `life_current`. */
const HEART_UNITS = 8;
/** Units at or above which the console's own display reads a heart full. */
const FULL_THRESHOLD = 5;
/** The console rounds health up to the next quarter heart before reading it. */
const QUARTER = 4;

const quantiseHeartFill = (fill: number): number => {
  const units = Math.min(HEART_UNITS, Math.max(0, fill * HEART_UNITS));
  const rounded = Math.ceil(units / QUARTER) * QUARTER;
  return rounded >= FULL_THRESHOLD ? 1 : rounded > 0 ? 0.5 : 0;
};

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

export { HudShape, quantiseHeartFill };
export type { HudShapeProps };
