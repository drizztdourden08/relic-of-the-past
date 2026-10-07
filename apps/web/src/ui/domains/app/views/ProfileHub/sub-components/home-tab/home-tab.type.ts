/* @layer renderer-components @kind types */
import type { ProfileRandomizerConfig } from '@shared/types/profile';

interface HomeTabProps {
  profileId: string;
  romFile: string;
  isGameRunning: boolean;
  onStartGame: () => void;
  onStopGame: () => void;
  onResetGame: () => void;
  lastPlayed?: number;
  created?: number;
  /** Frozen at profile creation; presence marks a randomized playthrough. */
  randomizer?: ProfileRandomizerConfig;
  vanillaSafe: boolean;
}

/** One label/value cell of the home summary panel. */
interface SummaryFact {
  label: string;
  value: string;
  /** Full value for the hover tooltip when the cell truncates. */
  title?: string;
  mono?: boolean;
  capitalize?: boolean;
}

/** Offline checks readout for one battery-save file (label = slot + 1). */
interface SaveFileChecks {
  slot: number;
  /** The player name stored in the file; null when blank. */
  name: string | null;
  taken: number;
  available: number;
  left: number;
  total: number;
}

interface SlotInfo {
  slot: number;
  timestamp: number | null;
  screenshot: string | null;
}

interface DialogState {
  type: 'overwrite' | 'delete' | 'create' | 'import-sram' | 'import-sram-invalid' | null;
  targetId?: string;
  targetName?: string;
  pendingBytes?: Uint8Array;
  detail?: string;
}

export type { HomeTabProps, SaveFileChecks, SlotInfo, DialogState, SummaryFact };
