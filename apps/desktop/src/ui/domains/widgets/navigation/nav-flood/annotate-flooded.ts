/* @layer renderer-widgets @kind logic */
import type { ScreenAnnotations } from '@rotp/navigation';
import { annotateScreen } from '../../../../../lib/game/flood';
import { screenIdForGameId } from '@rotp/game-data';
import type { AnnotateArgs } from './nav-flood.type';

const annotateFlooded = (args: AnnotateArgs): ScreenAnnotations[] => {
  const { fillResults, isIndoors, primaryScreenIndex, primaryScreenId } = args;
  return fillResults.map((r) => {
    const id = r.screenIndex === primaryScreenIndex || isIndoors
      ? primaryScreenId
      : screenIdForGameId({ kind: 'overworld', screen: r.screenIndex });
    if (!id) return null;
    return annotateScreen(
      id,
      { isIndoors, roomId: isIndoors ? r.screenIndex : 0, owScreenIndex: isIndoors ? 0 : r.screenIndex },
      r.reachable,
    );
  }).filter((a): a is ScreenAnnotations => a !== null);
};

export { annotateFlooded };
