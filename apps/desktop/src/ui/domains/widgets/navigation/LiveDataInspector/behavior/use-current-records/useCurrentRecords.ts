/* @layer renderer-widgets @kind hook */
import { useMemo } from 'react';
import type { EntityKind } from '@shared/game/data';
import type { DetectionContext } from '@shared/game/recommendations';
import type { LiveRecord } from '../../LiveDataInspector.type';
import { recordsFor } from './records-for';

const useCurrentRecords = (kind: EntityKind, context: DetectionContext): readonly LiveRecord[] =>
  useMemo(() => recordsFor(kind, context), [kind, context]);

export { useCurrentRecords };
