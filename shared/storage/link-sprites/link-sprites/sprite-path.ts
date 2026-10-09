/* @layer shared-storage @kind logic */
import { LINK_SPRITES_DIR } from './link-sprites.constants';

const spritePath = (name: string): string => `${LINK_SPRITES_DIR}/${name}`;

export { spritePath };
