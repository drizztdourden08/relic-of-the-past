/* @layer shared-storage @kind logic */
import { SPRITE_RE } from './link-sprites.constants';

const spriteStem = (name: string): string => name.replace(SPRITE_RE, '');

export { spriteStem };
