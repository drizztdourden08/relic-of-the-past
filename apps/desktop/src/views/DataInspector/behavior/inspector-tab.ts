/* @layer renderer-app @kind logic */
import type { DetailTab } from '@drizztdourden08/tessera/data';
import { DEFAULT_TAB } from '../DataInspector.constants';
import type { EditIntent, InspectorKind } from '../DataInspector.type';
import { isEntityKind } from './is-entity-kind';

const inspectorTab = (
  intent: EditIntent | null,
  kind: InspectorKind,
  selectedId: string | null,
  fallback: DetailTab | undefined,
): DetailTab => (
  intent && isEntityKind(kind) && intent.kind === kind && intent.id === selectedId
    ? 'editor'
    : fallback ?? DEFAULT_TAB
);

export { inspectorTab };
