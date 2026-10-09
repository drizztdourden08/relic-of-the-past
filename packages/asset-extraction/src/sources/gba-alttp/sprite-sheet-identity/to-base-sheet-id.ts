/* @layer shared-asset-extraction @kind logic */
import { BASE_SHEET_DELTA, SHEET_UNCHANGED } from './sprite-sheet-identity.constants';

const toBaseSheetId = (cartridgeId: number): number =>
  cartridgeId === SHEET_UNCHANGED ? SHEET_UNCHANGED : cartridgeId - BASE_SHEET_DELTA;

export { toBaseSheetId };
