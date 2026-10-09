/* @layer shared-game @kind logic */
import type { ScreenGameId, ScreenRecord } from '../../types';
import { screenIndexMaps } from './screen-index-maps';

const screenByGameId = (match: Partial<ScreenGameId>): ScreenRecord | undefined => {
  if (match.roomIndex !== undefined) return screenIndexMaps.byRoom.get(`${match.roomIndex}:${match.palaceIndex ?? ''}`);
  if (match.overworldIndex !== undefined) return screenIndexMaps.byOverworld.get(match.overworldIndex);
  return undefined;
};

export { screenByGameId };
