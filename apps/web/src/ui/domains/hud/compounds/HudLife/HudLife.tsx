/* @layer renderer-hud @kind component */
/**
 * HudLife draws the heart row (and, for the two callers that still want it, the
 * console's own caption above it).
 *
 * TWO ARTS, AND THE DEFAULT IS THE ENHANCED ONE. `heartArt` picks between the
 * drawn heart (`HudHeart`, with a fractional fill and an armour tint) and the
 * console's own extracted sprites (`HudSpriteHeart`). The Original style
 * replicates the console's bar out of the ROM's own artwork, so a drawn heart
 * there is a different game's interface, not a better one; it opts into
 * `'sprite'` alongside the caption. Every other caller is Enhanced and takes
 * the drawing. `armor` only reaches the drawn heart, because a baked bitmap
 * has nothing to tint.
 *
 * NO CAPTION IN THE ENHANCED HUD. `showCaption` defaults to false because the
 * enhanced style is hearts and nothing else, and the nine px the caption used
 * to cost was baked into the life block's published size for every caller. That is what
 * put the shipped magic bar under the second row of hearts. The two callers
 * that ARE drawing a replica of the console's own interface (the vanilla-styled
 * `HudView` top bar, and the pause status panel, where the caption is the row's
 * only label) opt back in, and neither is sized by `element-sizes.ts`.
 *
 * FILL IS A FRACTION. `HudHeart` takes 0..1 and clips its body at that share of
 * the width, so the two heart modes are a difference in what this component
 * hands it, not two renderers:
 *
 *  · `original` quantises with the console's own arithmetic. Health is rounded up
 *    to the next quarter-heart, then five units or more reads full and anything
 *    left over reads half. That is the game's rule, kept verbatim.
 *  · `smooth` hands over the true fraction and lets the heart ease to it.
 *
 * Only hearts the save actually holds are drawn; ten to a row, wrapping.
 */
import { HudBox } from '../../primitives/HudBox';
import { HudImage } from '../../primitives/HudImage';
import { HEART_TILE, HudHeart } from '../../primitives/HudHeart';
import { HudSpriteHeart } from '../../primitives/HudSpriteHeart';
import type { HeartMode } from '../../primitives/HudHeart';
import type { SpriteHeartState } from '../../primitives/HudSpriteHeart';

/** Which artwork the hearts are drawn from; see the header. */
type HeartArt = 'vector' | 'sprite';

/** Health units to a heart, and hearts to a row. */
const HEART_UNITS = 8;
const HEARTS_PER_ROW = 10;
/** The console rounds health up to the next quarter heart before reading it. */
const QUARTER = 4;
/** Units at or above which a heart reads full in the console's own display. */
const FULL_THRESHOLD = 5;

interface HudLifeProps {
  healthCurrent: number;
  healthCapacity: number;
  heartMode: HeartMode;
  /** Armour tier, 0..2. Tints every drawn heart. Ignored by the sprite art. */
  armor?: number;
  /** Which artwork to draw the hearts from. Enhanced's drawing by default. */
  heartArt?: HeartArt;
  /** Draw the console's LIFE caption above the hearts. Off by default. */
  showCaption?: boolean;
  scale: number;
  spritesBase: string;
}

/**
 * One entry per heart the save holds, each 0..1.
 * `original` reproduces the console's display rule; `smooth` is the true share.
 */
const heartFills = (current: number, hearts: number, mode: HeartMode): number[] => {
  const rounded = (current + (QUARTER - 1)) & ~(QUARTER - 1);
  const source = mode === 'original' ? rounded : current;
  return Array.from({ length: hearts }, (_, i) => {
    const left = source - i * HEART_UNITS;
    if (mode === 'original') return left >= FULL_THRESHOLD ? 1 : left > 0 ? 0.5 : 0;
    return Math.min(Math.max(left / HEART_UNITS, 0), 1);
  });
};

/**
 * The three pictures the ROM holds, from the fill the console's own rule
 * produced. Sprite hearts are always quantised that way whatever the heart
 * mode, because there is no third picture for a fraction to land on.
 */
const spriteStateFor = (fill: number): SpriteHeartState =>
  (fill >= 1 ? 'full' : fill > 0 ? 'half' : 'empty');

interface LifeCaptionProps {
  scale: number;
  spritesBase: string;
}

/** The console's caption, kept for the replicas that draw one. */
const LifeCaption = (props: LifeCaptionProps) => {
  const { scale, spritesBase } = props;
  const tile = HEART_TILE * scale;
  const shadow = scale;
  const sides = `drop-shadow(0 ${shadow}px 0 black) drop-shadow(${-shadow}px 0 0 black) drop-shadow(${shadow}px 0 0 black)`;

  return (
    <HudBox style={{ display: 'flex', justifyContent: 'center', height: tile + shadow }}>
      <HudImage src={`${spritesBase}hud-life-dash-left.png`} height={tile}
        style={{ imageRendering: 'pixelated', filter: sides }} />
      <HudImage src={`${spritesBase}hud-life-text.png`} height={tile}
        style={{ imageRendering: 'pixelated', filter: `drop-shadow(${shadow}px 0 0 black) drop-shadow(0 ${shadow}px 0 black)` }} />
      <HudImage src={`${spritesBase}hud-life-dash-right.png`} height={tile}
        style={{ imageRendering: 'pixelated', filter: sides }} />
    </HudBox>
  );
};

const HudLife = (props: HudLifeProps) => {
  const {
    healthCurrent, healthCapacity, heartMode,
    armor = 0, heartArt = 'vector', showCaption = false, scale, spritesBase,
  } = props;

  const tile = HEART_TILE * scale;
  const hearts = Math.floor(healthCapacity / HEART_UNITS);
  const fills = heartFills(healthCurrent, hearts, heartArt === 'sprite' ? 'original' : heartMode);

  return (
    <HudBox style={{ display: 'flex', flexDirection: 'column', width: HEARTS_PER_ROW * tile }}>
      {showCaption && <LifeCaption scale={scale} spritesBase={spritesBase} />}
      <HudBox style={{ display: 'flex', flexWrap: 'wrap', width: HEARTS_PER_ROW * tile }}>
        {fills.map((fill, i) => (heartArt === 'sprite'
          ? (
            <HudSpriteHeart
              key={i} state={spriteStateFor(fill)} mode={heartMode}
              scale={scale} spritesBase={spritesBase}
            />
          )
          : <HudHeart key={i} fill={fill} mode={heartMode} armor={armor} scale={scale} />
        ))}
      </HudBox>
    </HudBox>
  );
};

export { HEARTS_PER_ROW, HEART_UNITS, HudLife, heartFills, spriteStateFor };
export type { HeartArt, HudLifeProps };
