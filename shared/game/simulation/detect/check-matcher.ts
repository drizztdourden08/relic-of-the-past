/* @layer shared-game @kind logic */
/**
 * Best-effort naming of a raw flag diff, using the existing flag tables. This
 * is NAMING only — detection already happened via byte-diffing. Any diff that
 * matches no known check is reported as `unknown-check` so the recorder can
 * propose a dataset fix.
 */
import type { CheckDefinition } from '../../types';
import type { FlagDiff } from '../types';
import {
  CHECK_ROOM_FLAGS,
  DIRECT_ROOM_FLAGS,
  CHEST_OPEN_MASKS,
  CHECK_OVERWORLD_FLAGS,
  CHECK_NPC_FLAGS,
  CHECK_EVENT_FLAGS,
} from '../../checks/flags';
import { ALL_CHECKS } from '../../checks';

const UNKNOWN = 'unknown-check';

// Keyed by BOTH id and display name — flag matchers return canonical ids
// ("Sewers - Dark Cross") while some callers look up by short name.
const CHECK_BY_NAME = new Map<string, CheckDefinition>(ALL_CHECKS.flatMap(c => [[c.id, c], [c.name, c]] as [string, CheckDefinition][]));

const matchRoom = (diff: FlagDiff): string | null => {
  for (const [name, entry] of Object.entries(CHECK_ROOM_FLAGS)) {
    if (entry.roomId === diff.index && (CHEST_OPEN_MASKS[entry.chestIndex] & diff.setBits) !== 0) return name;
  }
  for (const [name, entry] of Object.entries(DIRECT_ROOM_FLAGS)) {
    if (entry.roomId === diff.index && (entry.mask & diff.setBits) !== 0) return name;
  }
  return null;
};

const matchOverworld = (diff: FlagDiff): string | null => {
  for (const [name, entry] of Object.entries(CHECK_OVERWORLD_FLAGS)) {
    if (entry.screen === diff.index && (entry.mask & diff.setBits) !== 0) return name;
  }
  return null;
};

const matchProgress = (diff: FlagDiff): string | null => {
  for (const [name, cfg] of Object.entries(CHECK_NPC_FLAGS)) {
    if (cfg.bufferIndex !== diff.index) continue;
    const hit = cfg.mask === 0xff ? diff.after !== 0 : (cfg.mask & diff.setBits) !== 0;
    if (hit) return name;
  }
  return matchEvent(diff);
};

/**
 * Progression events are THRESHOLD reads of the progress buffer, not bitmasks
 * (sram_progress_indicator 1 = post-uncle, 2 = rescued Zelda). A diff names an
 * event only when it CROSSES that threshold, and the highest crossed threshold
 * wins — reaching 2 is "Rescued Zelda", not "Zelda Rescue Started". Ids are
 * translated to display names so the log reads like every other check.
 */
const matchEvent = (diff: FlagDiff): string | null => {
  const crossed = Object.entries(CHECK_EVENT_FLAGS)
    .filter(([, cfg]) => cfg.bufferIndex === diff.index)
    .flatMap(([id, cfg]) => (Array.isArray(cfg.value) ? cfg.value : [cfg.value]).map((v) => ({ id, v, compare: cfg.compare })))
    .filter(({ v, compare }) => (compare === 'eq' || compare === 'any-of' ? diff.after === v : diff.before < v && diff.after >= v))
    .sort((a, b) => b.v - a.v);
  const best = crossed[0];
  return best ? (CHECK_BY_NAME.get(best.id)?.name ?? best.id) : null;
};

/** Name a single diff, or null if nothing matches. */
const matchDiff = (diff: FlagDiff): string | null => {
  if (diff.kind === 'room') return matchRoom(diff);
  if (diff.kind === 'overworld') return matchOverworld(diff);
  return matchProgress(diff);
};

/** First named match across a set of diffs; falls back to 'unknown-check'. */
const matchDiffs = (diffs: FlagDiff[]): { name: string; matched?: CheckDefinition } => {
  for (const diff of diffs) {
    const name = matchDiff(diff);
    if (name) return { name, matched: CHECK_BY_NAME.get(name) };
  }
  return { name: UNKNOWN };
};

export { matchDiff, matchDiffs, UNKNOWN };
