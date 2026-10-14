/* @layer renderer-widgets @kind logic */
import type { EntityKind } from '@rotp/game-data';
import type { DetectionContext } from '@rotp/navigation';
import { NO_LIVE_RECORDS } from '../LiveDataInspector.constants';
import type { LiveRecord } from '../LiveDataInspector.type';
import { RECORD_RESOLVERS } from './records-for.constants';

const recordsFor = (kind: EntityKind, context: DetectionContext): readonly LiveRecord[] =>
  RECORD_RESOLVERS[kind]?.(context) ?? NO_LIVE_RECORDS;

export { recordsFor };
