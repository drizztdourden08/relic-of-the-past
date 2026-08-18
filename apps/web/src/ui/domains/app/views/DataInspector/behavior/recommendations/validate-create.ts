/* @layer renderer-app @kind logic */
/**
 * Whether a `create` proposal can actually land, checked BEFORE the write.
 *
 * A draft record is minted from live registers alone, so it can be missing
 * things only a person knows. What counts as missing for a screen — a native
 * index, real geography that agrees with itself, a home on disk — is
 * `screen-validity`'s question rather than this file's, so a proposal accepted
 * here and a screen typed in by hand are held to exactly one standard.
 */
import { screenBlockers } from '@shared/game/logic/queries/screen-validity';
import type { EntityKind } from '@shared/game/data';
import type { ScreenCandidate } from '@shared/game/logic/queries/screen-validity';
import type { InspectorRow } from '../../DataInspector.type';

/** What the proposal is still missing, in words a reviewer can act on. Empty
 *  means it is writable as it stands. */
const createBlockers = (kind: EntityKind, proposed: InspectorRow): readonly string[] =>
  (kind === 'screen' ? screenBlockers(proposed as unknown as ScreenCandidate) : []);

export { createBlockers };
