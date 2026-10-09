/* @layer renderer-widgets @kind hook */
import { useMemo } from 'react';
import type { EntityKind } from '@rotp/game-data';
import type { DetectionContext } from '@rotp/navigation';
import type { LiveRecord } from '../../LiveDataInspector.type';
import { recordsFor } from './records-for';

const useCurrentRecords = (kind: EntityKind, context: DetectionContext): readonly LiveRecord[] =>
  useMemo(() => recordsFor(kind, context), [kind, context]);

export { useCurrentRecords };
