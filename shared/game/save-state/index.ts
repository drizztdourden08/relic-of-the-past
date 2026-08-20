/* @layer shared-game @kind barrel */
export { CURRENT_STATE_FORMAT } from './current-format.generated';
export { BASELINE, formatById, isCurrentFormatRegistered, KNOWN_FORMATS } from './formats';
export { checkLoadable, compareTargetFormat, describeStamp, describeTargetCompat } from './compatibility';
export { appendStamp, readSnapshotBytes, readStamp, stripStamp } from './state-file';
export type { KnownFormat, Loadability, StateStamp, TargetCompat } from './types';
