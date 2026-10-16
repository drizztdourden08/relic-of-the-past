/* @layer renderer-components @kind types */
import type { HeroSlots } from '@drizztdourden08/brock-react';
import type { Profile, FilePickerPort } from '@drizztdourden08/brock-core';
import type { ReactNode } from 'react';
import type { AutoSaveInfo, NormalSaveInfo } from '@rotp/game-core';
import type { UndoWindow } from './undo/undo.type';
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
  type: 'import-sram' | 'import-sram-invalid' | null;
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

interface SaveActionsBase {
  profileId: string;
  isGameRunning: boolean;
  onStartGame: () => void;
  undo: UndoWindow;
}

interface UseQuickSaveActionsParams extends SaveActionsBase {
  loadQuickSlots: () => Promise<void>;
}

interface UseNormalSaveActionsParams extends SaveActionsBase {
  loadNormalSaves: () => Promise<void>;
}

interface UseAutoSaveActionsParams extends SaveActionsBase {
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

interface RowSelection {
  selectedId: string | null;
  select: (id: string) => void;
  tabIndexOf: (id: string) => number;
}

interface NormalSaveRowProps extends HomeTabColumnsProps {
  save: NormalSaveInfo;
  selection: RowSelection;
  renaming: boolean;
  onStartRename: (id: string) => void;
  onRenameEnd: (id: string, name: string | null) => void;
}

interface QuickSlotRowProps extends HomeTabColumnsProps {
  info: SlotInfo;
  selection: RowSelection;
}

interface AutoSaveRowProps extends HomeTabColumnsProps {
  save: AutoSaveInfo;
  selection: RowSelection;
}

interface CreateSaveFormProps {
  onCreate: (name: string) => void;
  onCancel: () => void;
}

interface SectionHeadProps {
  title: string;
  action?: ReactNode;
}

export type {
  AutoSaveRowProps, AutoSavesData, CreateSaveFormProps, DialogState, HomeRandomizerStatus, HomeTabColumnsProps,
  HomeTabDialogProps, HomeTabDialogsProps, HomeHeroContentProps, NormalSaveRowProps, NormalSavesData, ProfileFactsInput,
  QuickSlotRowProps, RowSelection,
  SaveFileChecks, SectionHeadProps, SlotInfo, SummaryFact, UseAutoSaveActionsParams, UseHomeTabSavesParams,
  UseHomeTabSramImportParams, UseNormalSaveActionsParams, UseQuickSaveActionsParams,
};
