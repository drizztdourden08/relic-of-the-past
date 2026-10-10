/* @layer shared-asset-extraction @kind logic */
import { itemAt } from '../checked-read';
import { kCompBgPtrs } from './tables';

const bgSheetAddress = (sheet: number): number => itemAt(kCompBgPtrs, sheet, 'Background sheet pointer');

export { bgSheetAddress };
