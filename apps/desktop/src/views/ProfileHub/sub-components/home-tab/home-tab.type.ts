/* @layer renderer-components @kind types */
import type { HeroSlots } from '@drizztdourden08/brock-react';
import type { Profile, FilePickerPort } from '@drizztdourden08/brock-core';
import type { AutoSaveInfo, NormalSaveInfo } from '@rotp/game-core';
import type { useHomeTabSaves } from './useHomeTabSaves';

interface HomeHeroContentProps {
  slots: HeroSlots;
  profile: Profile;
  isGameRunning: boolean;
  onStartGame: () => void;
  onStopGame: () => void;
  onResetGame: () => void;
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
}

interface UseQuickSaveActionsParams {
  isGameRunning: boolean;
  onStartGame: () => void;
  loadQuickSlots: () => Promise<void>;
}

interface UseNormalSaveActionsParams {
  profileId: string;
  isGameRunning: boolean;
  onStartGame: () => void;
  setBusyNormal: (id: string | null) => void;
  setDialog: (dialog: DialogState) => void;
  loadNormalSaves: () => Promise<void>;
}

interface UseNormalSaveDialogsParams {
  profileId: string;
  dialog: DialogState;
  setDialog: (dialog: DialogState) => void;
  normalSaves: NormalSaveInfo[];
  setBusyNormal: (id: string | null) => void;
  loadNormalSaves: () => Promise<void>;
}

interface UseAutoSaveActionsParams {
  profileId: string;
  isGameRunning: boolean;
  onStartGame: () => void;
  loadAutoSaves: () => Promise<void>;
}

type HomeTabSaves = ReturnType<typeof useHomeTabSaves>;

interface HomeTabColumnsProps {
  saves: HomeTabSaves;
  isGameRunning: boolean;
}

interface HomeTabDialogsProps {
  saves: HomeTabSaves;
}

interface HomeTabDialogProps extends HomeTabDialogsProps {
  onClose: () => void;
}

export type {
  AutoSavesData, DialogState, HomeRandomizerStatus, HomeTabColumnsProps, HomeTabDialogProps, HomeTabDialogsProps,
  HomeHeroContentProps, NormalSavesData, ProfileFactsInput, SaveFileChecks, SlotInfo,
  SummaryFact, UseAutoSaveActionsParams, UseHomeTabSavesParams, UseHomeTabSramImportParams,
  UseNormalSaveActionsParams, UseNormalSaveDialogsParams, UseQuickSaveActionsParams,
};
