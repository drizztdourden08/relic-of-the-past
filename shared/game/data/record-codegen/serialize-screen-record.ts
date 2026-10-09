/* @layer shared-game @kind logic */
import type { ScreenRecord } from '../types';
import type { PendingScreenRecord } from './record-codegen.type';
import { SCREEN_SPEC } from './field-specs.constants';
import { recordLiteral } from './record-literal';

const serializeScreenRecord = (record: ScreenRecord | PendingScreenRecord): string =>
  recordLiteral(record as ScreenRecord, SCREEN_SPEC);

export { serializeScreenRecord };
