/* @layer renderer-components @kind types */
import type { OutfitId, PlayerSheet } from '@rotp/game-data';
import type { InstalledPack } from '@rotp/hub-contracts';
import type { SpriteViewerModel, useWearing } from '@rotp/design/packs';
import type { RomDisplayInfo } from '@app/views/GameSession/GameSession.type';
import type { ConfirmRequest } from '../InstalledOriginBar/InstalledOriginBar.type';
import type { useSpriteDraft } from './behavior/useSpriteDraft';
import type { useSpriteLibrary } from './behavior/useSpriteLibrary';
import type { useSpriteExport } from './behavior/useSpriteExport';

interface PlayerSpriteStudioProps {
  romStatuses: RomDisplayInfo[];
  onDeleteConfirm: (title: string, message: string, onConfirm: () => void) => void;
}

interface OpenDraft {
  file: string | null;
  sheet: PlayerSheet;
}

type Container = 'zspr' | 'rsp';

interface LibraryEntry {
  name: string;
  label: string;
  container: 'zspr' | 'rsp';
  preview: string | null;
}

interface PaletteEditorProps {
  sheet: PlayerSheet;
  outfit: OutfitId;
  readOnly?: boolean;
  onColor: (index: number, word: number) => void;
  onGloveColor: (slot: 0 | 1, word: number) => void;
  onReset: (index: number) => void;
}

type Slot = number | 'g0' | 'g1' | null;

interface SpriteLibraryListProps {
  entries: LibraryEntry[];
  loading: boolean;
  selected: string | null;
  isInstalled: (name: string) => boolean;
  onSelect: (name: string) => void;
  onDelete: (name: string) => void;
  onUrlImport: (url: string) => Promise<{ success: boolean; message: string }>;
  onFileImport: (files: File[]) => Promise<{ success: boolean; message: string }>;
}

type SpriteDraftModel = ReturnType<typeof useSpriteDraft>;
type SpriteLibraryModel = ReturnType<typeof useSpriteLibrary>;
type SpriteExportModel = ReturnType<typeof useSpriteExport>;
type WearingModel = ReturnType<typeof useWearing>;

interface StudioActionsParams {
  openFile: string | null;
  packFor: (name: string) => InstalledPack | null;
  confirmUninstall: (pack: InstalledPack, onDone: () => void) => void;
  onDeleteConfirm: ConfirmRequest;
  run: (task: () => Promise<unknown>) => Promise<void>;
  library: SpriteLibraryModel;
  draft: SpriteDraftModel;
}

interface StudioGroupsParams {
  sheet: PlayerSheet | null;
  canCreate: boolean;
  busy: boolean;
  readOnly: boolean;
  dirty: boolean;
  isNew: boolean;
  draft: SpriteDraftModel;
  library: SpriteLibraryModel;
  exporter: SpriteExportModel;
  run: (task: () => Promise<unknown>) => Promise<void>;
}

interface ViewerToolbarParams {
  open: boolean;
  wearing: WearingModel;
  viewer: SpriteViewerModel;
}

interface SpriteStatusProps {
  open: boolean;
  file: string | null;
  dirty: boolean;
  applied: boolean | null;
  readOnly: boolean;
}

interface SpriteNoticesProps {
  applied: boolean | null;
  readOnly: boolean;
  exportStatus: string;
  error: string | null;
}

interface SpriteWorkspaceProps {
  sheet: PlayerSheet | null;
  wearing: WearingModel;
  viewer: SpriteViewerModel;
}

interface SpriteDetailsPanelProps {
  sheet: PlayerSheet | null;
  outfit: OutfitId;
  readOnly: boolean;
  draft: SpriteDraftModel;
}

interface OutfitSwatchGridProps {
  colors: readonly number[];
  originals: readonly number[];
  slot: Slot;
  onOpen: (el: HTMLElement, slot: number) => void;
}

interface GloveSwatchGridProps {
  gloves: readonly number[];
  originalGloves: readonly number[];
  slot: Slot;
  onOpen: (el: HTMLElement, slot: 'g0' | 'g1') => void;
}

export type {
  Container, GloveSwatchGridProps, LibraryEntry, OpenDraft, OutfitSwatchGridProps, PaletteEditorProps,
  PlayerSpriteStudioProps, Slot, SpriteDetailsPanelProps, SpriteLibraryListProps, SpriteNoticesProps, SpriteStatusProps,
  SpriteWorkspaceProps, StudioActionsParams, StudioGroupsParams, ViewerToolbarParams,
};
