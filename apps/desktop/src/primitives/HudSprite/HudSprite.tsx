/* @layer renderer-hud @kind component */
import type { CSSProperties } from 'react';
import { SILHOUETTE_TONES, SILHOUETTE_VAR } from './HudSprite.constants';
import type { HudSpriteProps } from './HudSprite.type';
import { spriteFilter } from './behavior/sprite-filter';

const HudSprite = (props: HudSpriteProps) => {
  const { src, width, height, outline = false, silhouette = false, silhouetteTone, scale } = props;

  const style = {
    display: 'block',
    imageRendering: 'pixelated',
    filter: spriteFilter(silhouette, outline, scale),
    ...(silhouetteTone ? { [SILHOUETTE_VAR]: SILHOUETTE_TONES[silhouetteTone] } : {}),
  } as CSSProperties;

  return (
    <img
      src={src}
      width={width}
      height={height}
      draggable={false}
      style={style}
    />
  );
};

export { HudSprite };
