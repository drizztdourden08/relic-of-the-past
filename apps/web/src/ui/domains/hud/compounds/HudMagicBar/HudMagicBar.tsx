/* @layer renderer-hud @kind component */
/**
 * HudMagicBar is the enhanced HUD's magic meter: a green bar with a thin dark
 * border and a slight corner radius, drawn directly under the heart row, 80x16
 * SNES px and 5:1 WHEN FULL.
 *
 * The drawing itself is `HudMeter`, a bare primitive that knows only geometry.
 * What this compound adds is the three things the drawing must not decide:
 *
 * THE BAR'S OWN WIDTH IS THE QUANTITY. Half the magic is half the bar, border
 * and radius intact, and nothing where the rest of it would have been. This is
 * what makes the reference's last clause (none draws no meter at all) the end
 * of a continuum instead of a special case: a fixed frame would already have
 * drawn an empty frame at zero and there would have been nothing to say. The
 * element keeps its full 80x16 reserve at every value (the `<svg>` is always
 * that wide), so the hearts above and the counts beside it never move as the
 * player casts.
 *
 * THE HALF-MAGIC UPGRADE IS A SECOND BAND, not a tick. The tick this used to
 * draw marked the midpoint of a fixed trough, and a position only means
 * something while there is a full-length trough to be halfway along. Once the
 * bar's length IS the value there is no fixed midpoint to mark: a tick at half
 * the drawn bar slides left every time a spell is cast and says nothing about
 * an upgrade that never changes. The upgrade is a property of the whole meter,
 * as every spell costs half and the same bar goes exactly twice as far. So it is
 * drawn as a property of the whole bar: the interior splits lengthwise into two
 * stacked bands, each with its own sheen, reading as two bars' worth of casting
 * held in one. It is legible at every length including a sliver, it does not
 * move as the value moves, and it does not recolour the fill, which would fight
 * the single green the reference asks for.
 *
 * THE COLOURS ARE THE CONSOLE'S, not the design system's. The constants
 * file says why a HUD drawn over emulated output does not follow the app theme.
 */
import { HudMeter } from '../../primitives/HudMeter';
import {
  BAR_FRAME, BAR_HEIGHT, BAR_RADIUS, BAR_WIDTH,
  MAGIC_FRAME_COLOR, MAGIC_GREEN, MAGIC_MAX, MAGIC_SHEEN, MAGIC_SHEEN_OPACITY,
} from './HudMagicBar.constants';

/** With the upgrade the bar is worth two bars of casting, so it draws as two. */
const HALF_MAGIC_BANDS = 2;
const PLAIN_BANDS = 1;

interface HudMagicBarProps {
  /** Raw magic power, 0..128. Zero draws nothing. */
  value: number;
  halfMagic: boolean;
  scale: number;
}

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

export { HudMagicBar, MAGIC_MAX };
export type { HudMagicBarProps };
