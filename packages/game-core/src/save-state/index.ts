/* @layer shared-game @kind barrel */
export { CURRENT_STATE_FORMAT } from './current-format.constants';
export { checkLoadable } from './compatibility';
export { appendStamp, readSnapshotBytes, readStamp, stripStamp } from './state-file';
export type { StateStamp } from './save-state.type';
