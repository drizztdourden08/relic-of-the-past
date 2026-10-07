/* @layer renderer-lib @kind logic */
/**
 * The door every stored input profile comes through, and the only place a
 * pre-§19 slot list is turned into numbered slots.
 *
 * Profiles are read off disk as `unknown[]` and cast. That cast is exactly where
 * a slot list written when slots had position-derived ids (`slot:NORTH`) would
 * otherwise sail through as if it were the new shape. Every reader would then
 * see slots with an `index` of `undefined`, and the player's whole list would
 * silently read as one unnumbered blur. So the cast happens here instead, with
 * the migration in it.
 *
 * IT FAILS LOUDLY. `migrateSlotList` throws on a shape it cannot read, and this
 * lets that reach the console with the profile's name attached instead of
 * swallowing it and handing back a profile with no slots. An empty list is
 * indistinguishable from "the player never made any", which is precisely the
 * silent loss the rule exists to prevent. The profile is dropped from the
 * session instead of half-loaded, so nothing overwrites the file on disk and
 * the assignments are still there to recover.
 */
import { migrateSlotList } from '@shared/input/scheme';
import type { InputProfile } from '@shared/types/controls';

interface MigrationOutcome {
  profiles: InputProfile[];
  /** One message per profile that could not be read. Empty on a clean load. */
  failures: string[];
}

const nameOf = (raw: unknown, position: number): string => {
  const name = (raw as { name?: unknown } | null)?.name;
  return typeof name === 'string' && name ? name : `profile ${position}`;
};

/** One raw profile, with its modern slot list numbered. Throws on a bad shape. */
const migrateProfile = (raw: unknown): InputProfile => {
  const profile = raw as InputProfile & { modern?: { core: unknown; slots: unknown } };
  if (!profile.modern) return profile;
  const { slots } = migrateSlotList(profile.modern.slots);
  return { ...profile, modern: { ...profile.modern, slots } } as InputProfile;
};

/**
 * Every readable profile, and a message for each one that is not.
 *
 * A failure is reported, not thrown, so one unreadable profile does not
 * cost the player the other five; the caller decides how loud to be about it.
 */
const migrateProfiles = (raw: readonly unknown[]): MigrationOutcome => {
  const profiles: InputProfile[] = [];
  const failures: string[] = [];
  raw.forEach((entry, position) => {
    try {
      profiles.push(migrateProfile(entry));
    } catch (error: unknown) {
      const reason = error instanceof Error ? error.message : String(error);
      failures.push(`Input profile "${nameOf(entry, position)}" could not be loaded: ${reason}`);
    }
  });
  return { profiles, failures };
};

/** Migrate, and report every failure to the console. The common call. */
const migrateProfilesLoudly = (raw: readonly unknown[]): InputProfile[] => {
  const { profiles, failures } = migrateProfiles(raw);
  for (const failure of failures) console.error(`[controls] ${failure}`);
  return profiles;
};

export { migrateProfile, migrateProfiles, migrateProfilesLoudly };
export type { MigrationOutcome };
