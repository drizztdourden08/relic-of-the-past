/* @layer renderer-hud @kind logic */
import { SILHOUETTE_FILTER } from '../HudSprite.constants';
import { outlineFilter } from './outline-filter';

const spriteFilter = (silhouette: boolean, outline: boolean, scale: number): string | undefined => {
  if (silhouette) return SILHOUETTE_FILTER;
  if (outline) return outlineFilter(scale);
  return undefined;
};

export { spriteFilter };
