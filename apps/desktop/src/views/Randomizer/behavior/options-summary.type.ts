/* @layer renderer-components @kind types */
import type { OptionValue } from '@rotp/randomizer';

type SnapshotValues = Readonly<Record<string, OptionValue>>;

interface Tally {
  count: number;
  total: number;
}

interface ScopeFlag {
  id: string;
  label: string;
  on: boolean;
}

interface OptionsSummary {
  changed: Tally;
  scopes: Tally;
  scopeFlags: readonly ScopeFlag[];
  dungeonItems: Tally;
  rungs: Tally;
  storyGates: Tally;
  lights: Tally;
  lightRequired: boolean;
  ponds: Tally;
}

export type { OptionsSummary, ScopeFlag, SnapshotValues, Tally };
