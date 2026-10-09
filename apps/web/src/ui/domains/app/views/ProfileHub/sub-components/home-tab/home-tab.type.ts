/* @layer renderer-components @kind types */
import type { FilePickerPort } from '@shared/platform';
import type { ProfileRandomizerConfig } from '@shared/types/profile';
import type { AutoSaveInfo, NormalSaveInfo } from '@shared/types/saves';
import type { useHomeTabSaves } from './useHomeTabSaves';

interface HomeTabProps {
  profileId: string;
  romFile: string;
  isGameRunning: boolean;
  onStartGame: () => void;
  onStopGame: () => void;
  onResetGame: () => void;
  lastPlayed?: number;
  created?: number;
  randomizer?: ProfileRandomizerConfig;
  vanillaSafe: boolean;
}

interface SummaryFact {
  label: string;
  value: string;
  title?: string;
  mono?: boolean;
  capitalize?: boolean;
}

interface SaveFileChecks {
  slot: number;
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

interface ProfileFactsInput {
  romFile: string;
  lastPlayed?: number;
  created?: number;
}

interface HomeRandomizerStatus {
  sessionStatusLabel: string;
}

interface SavesWithScreenshots<T> {
  list: T[];
  screenshots: Record<string, string>;
}

type NormalSavesData = SavesWithScreenshots<NormalSaveInfo>;
type AutoSavesData = SavesWithScreenshots<AutoSaveInfo>;

interface UseHomeTabSavesParams {
  profileId: string;
  isGameRunning: boolean;
  onStartGame: () => void;
}

interface UseHomeTabSramImportParams {
  profileId: string;
  filePicker: FilePickerPort;
  dialog: DialogState;
  setDialog: (dialog: DialogState) => void;
  showToast: (message: string) => void;
}

type HomeTabSaves = ReturnType<typeof useHomeTabSaves>;

interface HomeTabColumnsProps {
  saves: HomeTabSaves;
  isGameRunning: boolean;
}

interface HomeTabDialogsProps {
  saves: HomeTabSaves;
}

export type {
  AutoSavesData, DialogState, HomeRandomizerStatus, HomeTabColumnsProps, HomeTabDialogsProps,
  HomeTabProps, HomeTabSaves, NormalSavesData, ProfileFactsInput, SaveFileChecks, SlotInfo,
  SummaryFact, UseHomeTabSavesParams, UseHomeTabSramImportParams,
};
