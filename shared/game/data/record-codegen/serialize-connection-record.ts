/* @layer shared-game @kind logic */
import type { ConnectionRecord } from '../types';
import type { PendingConnectionRecord } from './record-codegen.type';
import { CONNECTION_SPEC } from './field-specs.constants';
import { recordLiteral } from './record-literal';

const serializeConnectionRecord = (record: ConnectionRecord | PendingConnectionRecord): string =>
  recordLiteral(record as ConnectionRecord, CONNECTION_SPEC);

export { serializeConnectionRecord };
