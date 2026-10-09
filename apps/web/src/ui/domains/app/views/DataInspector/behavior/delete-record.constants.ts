/* @layer renderer-app @kind constants */
import type { EntityKind } from '@shared/game/data';
import type { RecordDeleter } from '../DataInspector.type';
import { deleteItemGroupRecord } from './delete-item-group-record';
import { deleteTagRecord } from './delete-tag-record';
import { facadeDeleter } from './facade-deleter';
import { screenEditor } from './screen-editor';

const DELETERS: Partial<Record<EntityKind, RecordDeleter>> = {
  tag: deleteTagRecord,
  'item-group': deleteItemGroupRecord,
  check: facadeDeleter('check', args => screenEditor().deleteCheck(args)),
  item: facadeDeleter('item', args => screenEditor().deleteItem(args)),
  dungeon: facadeDeleter('dungeon', args => screenEditor().deleteDungeon(args)),
  area: facadeDeleter('area', args => screenEditor().deleteArea(args)),
  location: facadeDeleter('location', args => screenEditor().deleteLocation(args)),
  actor: facadeDeleter('actor', args => screenEditor().deleteActor(args)),
};

export { DELETERS };
