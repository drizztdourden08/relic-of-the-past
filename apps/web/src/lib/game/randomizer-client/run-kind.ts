/* @layer bridge-wasm @kind logic */
/**
 * Which run is this: the plain game, a seed, or an online multiworld. One answer, asked by
 * every surface that behaves differently for one of them.
 *
 * It exists because the app used to ask `placement !== null` instead, and the boot gate parks
 * an online session with no placement (it has none: a server hands locations over one at a
 * time). So a multiworld read as plain play, which meant Normal's placement, the original item
 * at every location, and the wrong roster.
 *
 * The seed case carries its placement, so a caller that needs one gets it from the same answer
 * and no surface has to assert that a placement is there.
 *
 * Two questions, same vocabulary. The live one reads the session, for a surface showing the run
 * in progress; the profile one reads the frozen config, for a surface that answers before a
 * game is running at all (the home screen's per-save readout).
 */
import { getSessionState } from './session-store';
import type { SessionStoreState } from './session-store';
import type { RunKind } from '@shared/game/logic';
import type { Placement } from '@shared/randomizer/world/fill/placement.type';
import type { ProfileRandomizerConfig } from '@shared/types/profile';

type ActiveRun =
  | { kind: 'normal' }
  | { kind: 'seed'; placement: Placement }
  | { kind: 'online' };

/** An online session that ended (stopped, or refused with an error) is no run at all. */
const isEndedOnline = (session: SessionStoreState['session']): boolean =>
  session?.kind === 'online' && (session.status === 'idle' || session.status === 'error');

/**
 * The run a session state stands for. A live online session is online, even once its scouts
 * became a placement for the Spoiler tab; an ended one is plain play, never a seed, whatever
 * placement it left. Otherwise a placement is a seed.
 */
const runOfSession = ({ session, placement }: SessionStoreState): ActiveRun => {
  if (isEndedOnline(session)) return { kind: 'normal' };
  if (session?.kind === 'online') return { kind: 'online' };
  if (placement !== null) return { kind: 'seed', placement };
  return { kind: 'normal' };
};

/** The run the active session is, right now. */
const currentRun = (): ActiveRun => runOfSession(getSessionState());

/** The same answer as its kind alone, for a surface that only shows the run, never reads it. */
const runKindOfSession = (state: SessionStoreState): RunKind => runOfSession(state).kind;

/**
 * The run a profile is for, from the config frozen on it at creation. A local randomized
 * profile is a seed even before its placement is loaded, which is what the offline readouts
 * need: they run with no session at all.
 */
const runKindOfProfile = (randomizer: ProfileRandomizerConfig | undefined): RunKind => {
  if (randomizer === undefined) return 'normal';
  return randomizer.mode === 'online' ? 'online' : 'seed';
};

export { currentRun, runKindOfProfile, runKindOfSession };
export type { ActiveRun };
