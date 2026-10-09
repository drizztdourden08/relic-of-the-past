/* @layer shared-game @kind logic */
import type { ScreenRecord } from '../../../data';
import type { VariantGameState } from './detection.type';
import { resolveCurrentScreenDetailed } from './resolve-current-screen-detailed';

const resolveCurrentScreen = (isIndoors: boolean, palaceIndex: number, roomIndex: number, overworldScreenIndex: number, whichEntrance?: number, variantState?: VariantGameState): ScreenRecord | null =>
  resolveCurrentScreenDetailed(isIndoors, palaceIndex, roomIndex, overworldScreenIndex, whichEntrance, variantState)?.screen ?? null;

export { resolveCurrentScreen };
