/* @layer renderer-components @kind types */
import type { GameSettings, GbaDifference, GbaGroup } from '@rotp/features';

type EvidenceFilter = 'all' | 'in-progress';

interface GbaGroupRows {
  group: GbaGroup;
  rows: GbaDifference[];
}

interface GbaAvailability {
  hasSupplement: boolean;
  supplementFile: string | null;
}

interface GbaSettingsProps {
  settings: GameSettings;
  onChange: (patch: Partial<GameSettings>) => void;
}

interface GbaDifferenceRowProps {
  difference: GbaDifference;
}

export type { EvidenceFilter, GbaAvailability, GbaDifferenceRowProps, GbaGroupRows, GbaSettingsProps };
