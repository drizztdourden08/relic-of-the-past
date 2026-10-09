/* @layer renderer-app @kind logic */
import { screenBlockers } from '@rotp/game-data';
import type { EntityKind, ScreenCandidate } from '@rotp/game-data';
import type { InspectorRow } from '../../DataInspector.type';

const createBlockers = (kind: EntityKind, proposed: InspectorRow): readonly string[] =>
  (kind === 'screen' ? screenBlockers(proposed as unknown as ScreenCandidate) : []);

export { createBlockers };
