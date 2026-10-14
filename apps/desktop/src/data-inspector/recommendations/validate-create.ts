/* @layer renderer-app @kind logic */
import { screenBlockers } from '@rotp/game-data';
import type { EntityKind, ScreenCandidate } from '@rotp/game-data';
import type { InspectorRow } from '@app/views/DataInspector/DataInspector.type';
import { draftOf } from '@app/views/DataInspector/behavior/draft-of';

const createBlockers = (kind: EntityKind, proposed: InspectorRow): readonly string[] =>
  (kind === 'screen' ? screenBlockers(draftOf<ScreenCandidate>(proposed)) : []);

export { createBlockers };
