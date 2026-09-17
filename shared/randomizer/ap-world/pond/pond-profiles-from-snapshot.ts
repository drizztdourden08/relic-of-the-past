/* @layer shared-game @kind logic */
/**
 * Snapshot values → all three pond settings, and back. One read for the
 * generator, the options panel and the profile writer, so the three ponds can
 * never be read in two different orders or with two different fallbacks.
 *
 * `profiles` is what the SEED sees: the shared switch is already applied
 * (pond-share.ts), so a caller cannot forget it. `stored` is what the three
 * blocks hold, which is what a panel edits and what the writer puts back, and
 * the two are the same object while the switch is off.
 *
 * The shipped spelling is folded in first (pond-key-migration.data.ts): a
 * snapshot frozen when one pond was configurable reads as that pond's setting
 * and leaves the other two legacy. A snapshot carrying neither spelling reads
 * as the legacy pond three times over, which is what every profile written
 * before the option existed meant.
 */
import { POND_INSTANCES } from './pond-instances.data';
import { withMigratedPondKeys } from './pond-key-migration.data';
import { POND_SHARE_KEY, effectivePondProfiles, readsPondShare } from './pond-share';
import { parsePondSetting, pondValuesOf } from './pond-from-snapshot';
import type { ApOptionValue, RandomizerOptionsSnapshot } from '../options.type';
import type { PondProfiles } from './pond-profiles.type';
import type { Values } from './pond-from-snapshot';

interface ParsedPondProfiles {
  /** Every pond as the seed reads it, with the shared switch already applied. */
  profiles: PondProfiles;
  /** The rows each pond holds on its own, which is what the panel edits. */
  stored: PondProfiles;
  /** True while all three read the capacity pond's rows. */
  shared: boolean;
  /** One line per fallback applied, across every pond, each naming its own. */
  notes: readonly string[];
}

const parsePondProfiles = (values: Values): ParsedPondProfiles => {
  const migrated = withMigratedPondKeys(values);
  const parsed = POND_INSTANCES.map((pond) => ({ pond, ...parsePondSetting(migrated, pond) }));
  const stored = Object.fromEntries(parsed.map((entry) => [entry.pond.id, entry.setting])) as PondProfiles;
  const shared = readsPondShare(migrated);
  return {
    profiles: effectivePondProfiles(stored, shared),
    stored,
    shared,
    notes: parsed.flatMap((entry) => entry.notes),
  };
};

const pondProfilesFromSnapshot = (snapshot: RandomizerOptionsSnapshot): PondProfiles =>
  parsePondProfiles(snapshot.values).profiles;

/** The rows three settings and the shared switch write: the inverse of parsePondProfiles. */
const pondProfileValuesOf = (
  profiles: PondProfiles, shared = false,
): Record<string, ApOptionValue> => ({
  ...Object.assign({}, ...POND_INSTANCES.map((pond) => pondValuesOf(profiles[pond.id], pond))) as
    Record<string, ApOptionValue>,
  [POND_SHARE_KEY]: shared,
});

export { parsePondProfiles, pondProfileValuesOf, pondProfilesFromSnapshot };
export type { ParsedPondProfiles };
