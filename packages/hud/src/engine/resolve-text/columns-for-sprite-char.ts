/* @layer shared-hud @kind logic */
import { AMPERSAND_COLUMNS } from './resolve-text.constants';

const columnsForSpriteChar = (char: string): number => (char === '&' ? AMPERSAND_COLUMNS : 1);

export { columnsForSpriteChar };
