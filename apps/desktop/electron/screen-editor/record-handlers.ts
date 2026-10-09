/* @layer electron-main @kind logic */
import { handle } from '../lib/ipc/handle';
import { allocateActor, deleteActor, writeActorRecord } from './actor-writer';
import { allocateCheck, deleteCheck, writeCheckRecord } from './check-writer';
import { allocateDungeon, deleteDungeon, writeDungeonRecord } from './dungeon-writer';
import { allocateItem, deleteItem, writeItemRecord } from './item-writer';
import { deleteArea, deleteLocation, writeAreaRecord, writeLocationRecord } from './geography-writer';
import { guard } from './guard';

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
