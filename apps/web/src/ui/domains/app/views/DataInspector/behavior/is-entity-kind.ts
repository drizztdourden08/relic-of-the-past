/* @layer renderer-app @kind logic */
import type { EntityKind } from '@shared/game/data';
import { RECOMMENDATIONS_KIND } from '../DataInspector.constants';
import type { InspectorKind } from '../DataInspector.type';

const isEntityKind = (kind: InspectorKind): kind is EntityKind => kind !== RECOMMENDATIONS_KIND;

export { isEntityKind };
