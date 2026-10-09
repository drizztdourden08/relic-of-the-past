/* @layer renderer-hud @kind component */
import { HudBox } from '../../primitives/HudBox';
import { HEART_TILE, HudHeart } from '../../primitives/HudHeart';
import { HudSpriteHeart } from '../../primitives/HudSpriteHeart';
import { HEARTS_PER_ROW, HEART_UNITS } from './HudLife.constants';
import type { HudLifeProps } from './HudLife.type';
import { heartFills } from './behavior/heart-fills';
import { spriteStateFor } from './behavior/sprite-state-for';
import { LifeCaption } from './sub-components/LifeCaption';

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

export { HudLife };
