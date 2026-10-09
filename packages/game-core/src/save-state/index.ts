/* @layer shared-game @kind barrel */
export { CURRENT_STATE_FORMAT } from './current-format.generated';
export { BASELINE, KNOWN_FORMATS } from './formats';
export { formatById } from './format-by-id';
export { isCurrentFormatRegistered } from './is-current-format-registered';
export { checkLoadable, compareTargetFormat, describeStamp, describeTargetCompat } from './compatibility';
export { appendStamp, readSnapshotBytes, readStamp, stripStamp } from './state-file';
export type { KnownFormat, Loadability, StateStamp, TargetCompat } from './save-state.type';
