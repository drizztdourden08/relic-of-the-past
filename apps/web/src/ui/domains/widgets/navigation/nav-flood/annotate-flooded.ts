/* @layer renderer-widgets @kind logic */
/**
 * Annotates EVERY screen the flood covered, not just the one the player stands on.
 *
 * On a multi-screen area, annotating only the player's screen hides three quarters
 * of the mechanics.
 */
import type { FloodFillResult } from '@shared/game/navigation';
import type { ScreenAnnotations } from '@shared/game/simulation';
import { annotateScreen } from '../../../../../lib/game/flood';
import { screenIdForGameId } from '@shared/game/logic/queries/game-id';

interface AnnotateArgs {
  fillResults: FloodFillResult[];
  isIndoors: boolean;
  primaryScreenIndex: number;
  /** The DETECTED screen's own id — the only correct id for an indoor room. */
  primaryScreenId: string | null;
}

const annotateFlooded = (args: AnnotateArgs): ScreenAnnotations[] => {
  const { fillResults, isIndoors, primaryScreenIndex, primaryScreenId } = args;
  return fillResults.map((r) => {
    // Indoors the flood covers exactly one room, so the detected id IS this
    // screen's id. Outdoors, a sub-screen's id is resolved from the screen DATA
    // via its game id — never formatted from the index by hand.
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
