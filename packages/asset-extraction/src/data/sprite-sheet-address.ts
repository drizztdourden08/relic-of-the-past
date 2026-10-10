/* @layer shared-asset-extraction @kind logic */
import { itemAt } from '../checked-read';
import { kCompSpritePtrs } from './tables';

const spriteSheetAddress = (sheet: number): number => itemAt(kCompSpritePtrs, sheet, 'Sprite sheet pointer');

export { spriteSheetAddress };
