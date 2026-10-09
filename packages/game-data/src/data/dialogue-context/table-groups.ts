/* @layer shared-game @kind data */
import type { ContextTableGroup } from './dialogue-context.type';

const signGroup: ContextTableGroup = {
  trigger: 'sign',
  source: 'overworld.c:299 (kOverworld_SignText)',
  ids: [
    60, 61, 62, 63, 64, 65, 66, 67, 68, 69, 70, 71, 72, 73, 74,
    168, 169, 170, 171, 172, 173, 174, 175, 176, 177, 178,
  ],
};

const telepathyGroup: ContextTableGroup = {
  trigger: 'telepathy',
  source: 'dungeon.c:2381 (kDungeonRoomTeleMsg)',
  ids: [
    181, 182, 185, 186, 187, 188, 191, 192, 193, 194,
    195, 196, 197, 198, 199, 200, 378,
  ],
};

const itemGetGroups: ContextTableGroup[] = [
  {
    trigger: 'item-get',
    source: 'ancilla.c:243 (kReceiveItemMsgs)',
    ids: [
      82, 83, 84, 85, 86, 87, 88, 89, 90, 91, 93, 94, 95, 96, 97,
      98, 99, 100, 101, 102, 103, 104, 105, 106, 107, 108, 109, 110,
      111, 113, 114, 115, 116, 117, 118, 119, 120, 121, 122, 125,
      133, 144, 345, 346,
    ],
  },
  {
    trigger: 'item-get',
    source: 'ancilla.c:250 (kReceiveItemMsgs2)',
    ids: [92, 132],
  },
  {
    trigger: 'item-get',
    source: 'ancilla.c:251 (kReceiveItemMsgs3)',
    ids: [342, 343, 344],
  },
];

const tableGroups: ContextTableGroup[] = [signGroup, telepathyGroup, ...itemGetGroups];

export { tableGroups };
