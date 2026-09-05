/* @layer renderer-widgets @kind logic */
/**
 * Annotates EVERY screen the flood covered, not just the one the player stands on.
 * On a multi-screen area, annotating only the player's screen hid three quarters of
 * the mechanics. The entry tile still only applies to the player's own screen, since
 * that is where the walk distances are measured from.
 */
import type { FloodFillResult, GridPos } from '@shared/game/navigation';
import type { ScreenAnnotations } from '@shared/game/simulation';
import { annotateScreen } from '../../../../../lib/game/flood';
import { screenIdForGameId } from '@shared/game/logic/queries/game-id';

interface AnnotateArgs {
  fillResults: FloodFillResult[];
  isIndoors: boolean;
  primaryScreenIndex: number;
  startPos?: GridPos;
  /** The DETECTED screen's own id, which is the only correct id for an indoor room. */
  primaryScreenId: string | null;
}

const annotateFlooded = (args: AnnotateArgs): ScreenAnnotations[] => {
  const { fillResults, isIndoors, primaryScreenIndex, startPos, primaryScreenId } = args;
  return fillResults.map((r) => {
    // Indoors the flood covers exactly one room, so the detected id IS this
    // screen's id. Outdoors, a sub-screen's id is resolved from the screen DATA
    // via its game id. Never format it from the index by hand.
    const id = r.screenIndex === primaryScreenIndex || isIndoors
      ? primaryScreenId
      : screenIdForGameId({ kind: 'overworld', screen: r.screenIndex });
    if (!id) return null;
    return annotateScreen(
      id,
      { isIndoors, roomId: isIndoors ? r.screenIndex : 0, owScreenIndex: isIndoors ? 0 : r.screenIndex },
      r.screenIndex === primaryScreenIndex ? startPos : undefined,
      r.reachable,
    );
  }).filter((a): a is ScreenAnnotations => a !== null);
};

export { annotateFlooded };
