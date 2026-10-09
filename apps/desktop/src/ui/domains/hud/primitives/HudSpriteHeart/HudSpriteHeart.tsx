/* @layer renderer-hud @kind component */
import { HudBox } from '../HudBox';
import { HudImage } from '../HudImage';
import {
  SPRITE_FILE, SPRITE_HEART_PULSE, SPRITE_HEART_STATES, SPRITE_HEART_SWAP_MS, SPRITE_HEART_TILE,
} from './HudSpriteHeart.constants';
import type { HudSpriteHeartProps, SpriteHeartState } from './HudSpriteHeart.type';

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

export { HudSpriteHeart };
