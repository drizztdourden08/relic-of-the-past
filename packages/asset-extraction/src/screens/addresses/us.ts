/* @layer shared-asset-extraction @kind data */
import type { ScreenAddressTable } from '../screen-payload.type';

const US_SCREEN_ADDRESSES: ScreenAddressTable = {
  id: 'us',
  menuTilemaps: [0xcdd6d, 0xce7bf, 0xce2a8, 0xce63c, 0xce456, 0xeda9c],
  selectFile: {
    gfx0: { address: 0x8ce1c8, count: 224 },
    nameStripes: { address: 0x8ce359, count: 253 },
    copySelect: { address: 0x8ce68d, count: 173 },
    copyBlinker: { address: 0x8cd0ee, count: 73 },
    copyTargetTab0: { address: 0x8ce73a, count: 133 },
    copyTargetTab2: { address: 0x8cd23a, count: 49 },
    killTarget: { address: 0x8ce53f, count: 253 },
    killTargetTab2: { address: 0x8cd41e, count: 101 },
  },
  nameGrid: { address: 0x8cd935, count: 128 },
  pauseText: {
    ability: { address: 0x8df959, count: 80 },
    gloves: { address: 0x8df931, count: 20 },
    bottles: { address: 0x8df449, count: 128 },
    mushroom: { address: 0x8df549, count: 16 },
    flute: { address: 0x8df569, count: 32 },
    mirror: { address: 0x8df5a9, count: 16 },
    bow: { address: 0x8df5c9, count: 48 },
    items: { address: 0x8df1c9, count: 320 },
    dungeonItems: { address: 0x8ded09, count: 16 },
  },
  dungeonMapLabels: { address: 0x8af009, count: 744 },
  endingCaptions: {
    offsets: { address: 0x8ec2e1, count: 17 },
    data: { address: 0x8ebf4c, count: 917 },
  },
  credits: {
    text: { address: 0x8eb178, count: 1989 },
    offsets: { address: 0x8eb93d, count: 394 },
    map: { address: 0x8eb038, count: 160 },
  },
  sheetPointers: { spr: 0x00cff3, bg: 0x00cf80 },
  sheets: { spr: [105, 106, 107], bg: [] },
};

export { US_SCREEN_ADDRESSES };
