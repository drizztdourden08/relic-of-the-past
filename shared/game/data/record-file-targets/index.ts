/* @layer shared-game @kind barrel */
export { recordArrayName } from './array-name';
export { checkRecordFile } from './check-files';
export type { CheckHome } from './check-files';
export {
  actorRecordFile, areaRecordFile, dungeonRecordFile, itemRecordFile, locationRecordFile, regionRecordFile,
} from './collection-files';
export type { ItemHome } from './collection-files';
export { AREA_FOLDERS, DUNGEON_FLOORS, SPLIT_BY_HALF } from './layout';
export type { FileTarget } from './layout';
export {
  connectionRecordFile, dungeonForPalaceIndex, dungeonForScreen, screenRecordFile,
} from './screen-files';
export type { ScreenHome } from './screen-files';
