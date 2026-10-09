/* @layer renderer-widgets @kind logic */
import type { ConnectionRecord, ScreenId } from '@rotp/game-data';
import { pairLinksScreens } from '@rotp/game-data';
import { otherEndpoint } from './other-endpoint';

const storedOnFarSide = (
  screenId: ScreenId | null,
  key: string,
  all: readonly ConnectionRecord[],
  here: readonly ConnectionRecord[],
): boolean => {
  if (!screenId) return false;
  const targetId = key as ScreenId;
  return pairLinksScreens(all, screenId, targetId)
    && !here.some(c => otherEndpoint(screenId, c) === targetId);
};

export { storedOnFarSide };
