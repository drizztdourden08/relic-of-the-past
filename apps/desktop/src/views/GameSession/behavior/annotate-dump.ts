/* @layer renderer-appshell @kind logic */
import { annotateScreen } from '@app/game/flood';
import type { FloodRun, RunFloodArgs } from './dump-nav.type';

const annotateDump = (args: RunFloodArgs, run: FloodRun | null) => {
  const { isIndoors, roomIndex, overworldScreenIndex, screenId } = args;
  if (!screenId || !run) return null;
  return annotateScreen(
    screenId,
    { isIndoors, roomId: isIndoors ? roomIndex : 0, owScreenIndex: isIndoors ? 0 : overworldScreenIndex },
    run.result.reachable,
  );
};

export { annotateDump };
