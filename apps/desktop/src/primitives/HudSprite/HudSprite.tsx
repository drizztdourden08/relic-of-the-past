/* @layer renderer-hud @kind component */
import type { CSSProperties } from 'react';
import { SILHOUETTE_FILTER, SILHOUETTE_TONES, SILHOUETTE_VAR } from './HudSprite.constants';
import type { HudSpriteProps } from './HudSprite.type';
import { outlineFilter } from './behavior/outline-filter';

const HudSprite = (props: HudSpriteProps) => {
  const { src, width, height, outline = false, silhouette = false, silhouetteTone, scale } = props;

  const filter = silhouette ? SILHOUETTE_FILTER : (outline ? outlineFilter(scale) : undefined);
  const style = {
    display: 'block',
    imageRendering: 'pixelated',
    filter,
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
