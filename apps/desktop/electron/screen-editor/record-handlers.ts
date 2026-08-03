/* @layer electron-main @kind logic */
/**
 * IPC registration for the six record-facade collections.
 *
 * Kept apart from ipc-handlers.ts because these eighteen channels are all one
 * shape — take the workspace root and a record payload, report a thrown error
 * as a refusal rather than letting it cross the bridge — so each is a single
 * line here, and the older editor channels (which each carry a payload of their
 * own) stay readable next to each other over there.
 */

import { handle } from '../lib/ipc/handle';
import { allocateActor, deleteActor, writeActorRecord } from './actor-writer';
import { allocateCheck, deleteCheck, writeCheckRecord } from './check-writer';
import { allocateDungeon, deleteDungeon, writeDungeonRecord } from './dungeon-writer';
import { allocateItem, deleteItem, writeItemRecord } from './item-writer';
import { deleteArea, deleteLocation, writeAreaRecord, writeLocationRecord } from './geography-writer';
import { getWorkspaceRoot } from './workspace-root';

type Refusal = { success: false; error: string };

const failed = (e: unknown): Refusal =>
  ({ success: false, error: e instanceof Error ? e.message : 'Unknown error' });

/** Runs a writer against the workspace root, turning a throw into a refusal. */
const guard = async <A, R>(write: (root: string, args: A) => Promise<R>, args: A): Promise<R | Refusal> => {
  try {
    return await write(getWorkspaceRoot(), args);
  } catch (e: unknown) {
    return failed(e);
  }
};

const registerRecordHandlers = (): void => {
  handle('screenEditor:allocateCheck', (_e, args) => guard(allocateCheck, args));
  handle('screenEditor:writeCheckRecord', (_e, args) => guard(writeCheckRecord, args));
  handle('screenEditor:deleteCheck', (_e, args) => guard(deleteCheck, args));

  handle('screenEditor:allocateItem', (_e, args) => guard(allocateItem, args));
  handle('screenEditor:writeItemRecord', (_e, args) => guard(writeItemRecord, args));
  handle('screenEditor:deleteItem', (_e, args) => guard(deleteItem, args));

  handle('screenEditor:allocateDungeon', (_e, args) => guard(allocateDungeon, args));
  handle('screenEditor:writeDungeonRecord', (_e, args) => guard(writeDungeonRecord, args));
  handle('screenEditor:deleteDungeon', (_e, args) => guard(deleteDungeon, args));

  handle('screenEditor:allocateActor', (_e, args) => guard(allocateActor, args));
  handle('screenEditor:writeActorRecord', (_e, args) => guard(writeActorRecord, args));
  handle('screenEditor:deleteActor', (_e, args) => guard(deleteActor, args));

  handle('screenEditor:writeAreaRecord', (_e, args) => guard(writeAreaRecord, args));
  handle('screenEditor:deleteArea', (_e, args) => guard(deleteArea, args));

  handle('screenEditor:writeLocationRecord', (_e, args) => guard(writeLocationRecord, args));
  handle('screenEditor:deleteLocation', (_e, args) => guard(deleteLocation, args));
};

export { registerRecordHandlers };
