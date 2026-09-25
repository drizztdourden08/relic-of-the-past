/* @layer renderer-hud @kind component */
/**
 * HudSpriteHeart blits one heart of the life meter from the console's own
 * extracted artwork.
 *
 * A SECOND COMPONENT INSTEAD OF A MODE ON `HudHeart`, and the reason is that
 * the two share nothing but a name and an 8x8 box. `HudHeart` is a path, a
 * palette and three armour tints cut at an arbitrary fraction of the width;
 * this is a choice between three PNGs. Their props do not overlap either (one
 * wants `fill` and `armor`, the other wants `state` and `spritesBase`), so a
 * `mode` flag on one component would be a switch between two disjoint
 * implementations behind one signature, with every caller passing the half of
 * the props the other mode ignores.
 *
 * WHICH STYLE GETS WHICH IS THE POINT. The Original HUD style exists to
 * replicate the console's own bar out of sprites extracted from the ROM; a
 * drawn heart there is not an improvement, it is a different game's interface.
 * The custom art belongs to Enhanced, which is the style that asked for a
 * fractional fill and an armour tint in the first place.
 *
 * THREE STATES, ALWAYS THE CONSOLE'S OWN QUANTISING. There is no intermediate
 * picture to travel to, so `mode` here decides only whether the swap is
 * instant or crossfades, not what is drawn. `HudLife` owns the quantising
 * for both arts, because it is the one that knows the save's health units.
 *
 * The crossfade holds all three sprites mounted and moves opacity between
 * them instead of mounting a second copy and animating it. That is what
 * keeps it a plain CSS transition: a freshly inserted element has no previous
 * opacity to travel from, which is why the version this replaces needed a pair
 * of `@keyframes` in a stylesheet the primitive did not own.
 */
import { HudBox } from '../HudBox';
import { HudImage } from '../HudImage';
import type { HeartMode } from '../HudHeart';

/** How full one heart reads, in the only three pictures the ROM holds. */
type SpriteHeartState = 'full' | 'half' | 'empty';

interface HudSpriteHeartProps {
  state: SpriteHeartState;
  mode: HeartMode;
  /** SNES px to CSS px; a heart is 8 SNES px square. */
  scale: number;
  spritesBase: string;
}

/** One heart's side, in SNES pixels. It is the same box the drawn heart uses. */
const SPRITE_HEART_TILE = 8;

/** Drawn in this order so the stack's paint order is stable across a swap. */
const SPRITE_HEART_STATES: readonly SpriteHeartState[] = ['empty', 'half', 'full'];

const SPRITE_FILE: Readonly<Record<SpriteHeartState, string>> = {
  full: 'hud-heart-full',
  half: 'hud-heart-half',
  empty: 'hud-heart-empty',
};

/** How long a swap takes to travel in the smooth mode. */
const SPRITE_HEART_SWAP_MS = 200;
/** The beat: the outgoing picture swells as it goes, the incoming settles in. */
const SPRITE_HEART_PULSE = 1.15;

const HudSpriteHeart = (props: HudSpriteHeartProps) => {
  const { state, mode, scale, spritesBase } = props;

  const side = SPRITE_HEART_TILE * scale;
  const srcFor = (s: SpriteHeartState): string => `${spritesBase}${SPRITE_FILE[s]}.png`;

  if (mode === 'original') {
    return (
      <HudImage
        src={srcFor(state)}
        width={side}
        height={side}
        style={{ display: 'block', imageRendering: 'pixelated' }}
      />
    );
  }

  return (
    <HudBox style={{ position: 'relative', width: side, height: side }}>
      {SPRITE_HEART_STATES.map((s) => {
        const showing = s === state;
        return (
          <HudImage
            key={s}
            src={srcFor(s)}
            width={side}
            height={side}
            style={{
              position: 'absolute',
              inset: 0,
              display: 'block',
              imageRendering: 'pixelated',
              opacity: showing ? 1 : 0,
              transform: showing ? 'scale(1)' : `scale(${SPRITE_HEART_PULSE})`,
              transition: `opacity ${SPRITE_HEART_SWAP_MS}ms ease-out,`
                + ` transform ${SPRITE_HEART_SWAP_MS}ms ease-out`,
            }}
          />
        );
      })}
    </HudBox>
  );
};

export { SPRITE_HEART_STATES, SPRITE_HEART_SWAP_MS, SPRITE_HEART_TILE, HudSpriteHeart };
export type { HudSpriteHeartProps, SpriteHeartState };
