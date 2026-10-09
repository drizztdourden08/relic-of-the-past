/* @layer renderer-lib @kind logic */
import type { InputProfile } from '@shared/types/controls';
import type { MigrationOutcome } from './migrate-profiles.type';
import { migrateProfile } from './migrate-profile';

const nameOf = (raw: unknown, position: number): string => {
  const name = (raw as { name?: unknown } | null)?.name;
  return typeof name === 'string' && name ? name : `profile ${position}`;
};

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

export { migrateProfiles };
