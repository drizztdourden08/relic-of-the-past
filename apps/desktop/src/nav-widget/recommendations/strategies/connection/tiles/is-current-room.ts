/* @layer renderer-widgets @kind logic */
import { get } from '@rotp/game-data';
import type { ScreenObservations } from '@rotp/navigation';

const isCurrentRoom = (observations: ScreenObservations, screenId: string): boolean => {
  const live = observations.liveGameId;
  if (live?.roomIndex == null) return false;
  return get('screen', screenId)?.gameId.roomIndex === live.roomIndex;
};

export { isCurrentRoom };
