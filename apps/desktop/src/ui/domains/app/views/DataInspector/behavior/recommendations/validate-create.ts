/* @layer renderer-app @kind logic */
import { screenBlockers } from '@shared/game/logic/queries/screen-validity';
import type { EntityKind } from '@shared/game/data';
import type { ScreenCandidate } from '@shared/game/logic/queries/screen-validity';
import type { InspectorRow } from '../../DataInspector.type';

const createBlockers = (kind: EntityKind, proposed: InspectorRow): readonly string[] =>
  (kind === 'screen' ? screenBlockers(proposed as unknown as ScreenCandidate) : []);

export { createBlockers };
