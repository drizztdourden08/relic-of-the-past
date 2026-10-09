/* @layer renderer-lib @kind logic */
import { getScreenLookup } from '@shared/game/logic/queries/detection';
import type { EntranceType } from './entrance-icons.type';

const destinationIconType = (roomId: number): EntranceType => {
  const screen = getScreenLookup().byCaveRoom.get(roomId);
  if (!screen) return 'overworld';
  if (screen.kind === 'dungeon') return 'dungeon';
  if (screen.kind === 'interior') {
    const kind = screen.interiorKind;
    if (kind === 'shop') return 'shop';
    if (kind === 'fairy') return 'fairy';
    if (kind === 'house') return 'house';
    if (kind === 'cave') return 'cave';
  }
  return 'door';
};

export { destinationIconType };
