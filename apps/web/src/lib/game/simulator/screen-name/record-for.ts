/* @layer bridge-wasm @kind logic */
import { findOne, getScreenByGameId } from '@shared/game/data';
import type { ScreenRecord } from '@shared/game/data';
import type { TraversalId } from '@shared/game/simulation';
import { SYNTHETIC_OW, SYNTHETIC_ROOM } from '../screen-location.constants';
import { interiorFor } from './interior-for';

const recordFor = (id: TraversalId, palace?: number): ScreenRecord | undefined => {
  const known = findOne('screen', (s) => s.id === id);
  if (known) return known;
  const overworld = SYNTHETIC_OW.exec(id);
  if (overworld) return getScreenByGameId({ overworldIndex: Number(overworld[1]) });
  const room = SYNTHETIC_ROOM.exec(id);
  return room ? interiorFor(Number(room[1]), palace) : undefined;
};

export { recordFor };
