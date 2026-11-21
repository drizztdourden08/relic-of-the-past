/* @layer shared-asset-extraction @kind data */
import type { ScreenAddressTable } from '../screen-payload.type';
import { PAUSE_TEXT_COMMON } from './pause-text-common';

const US_EN_SHARED: Pick<ScreenAddressTable, 'dungeonMapLabels' | 'pauseText' | 'sheetPointers'> = {
  pauseText: {
    ...PAUSE_TEXT_COMMON,
    ability: { address: 0x8df959, count: 80 },
    gloves: { address: 0x8df931, count: 20 },
    bow: { address: 0x8df5c9, count: 48 },
  },
  dungeonMapLabels: { address: 0x8af009, count: 744 },
  sheetPointers: { spr: 0x00cff3, bg: 0x00cf80 },
};

export { US_EN_SHARED };
