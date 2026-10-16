/* @layer renderer-components @kind types */
import type { OutfitId, PlayerSheet } from '@rotp/game-data';
import type { InstalledPack } from '@rotp/hub-contracts';
import type { SpriteViewerModel, useWearing } from '@rotp/design/packs';
import type { StatusTone } from '@drizztdourden08/tessera/primitives';
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
  canCreate: boolean;
  busy: boolean;
  error: string | null;
  isInstalled: (name: string) => boolean;
  onSelect: (name: string) => void;
  onCreate: () => void;
  onDelete: (name: string) => void;
  onUrlImport: (url: string) => Promise<{ success: boolean; message: string }>;
  onFileImport: (files: File[]) => Promise<{ success: boolean; message: string }>;
}

type SpriteDraftModel = ReturnType<typeof useSpriteDraft>;
type SpriteLibraryModel = ReturnType<typeof useSpriteLibrary>;
type SpriteExportModel = ReturnType<typeof useSpriteExport>;
type WearingModel = ReturnType<typeof useWearing>;
type StudioTaskRunner = (task: () => Promise<unknown>) => Promise<void>;

interface StudioActionsParams {
  openFile: string | null;
  packFor: (name: string) => InstalledPack | null;
  confirmUninstall: (pack: InstalledPack, onDone: () => void) => void;
  onDeleteConfirm: ConfirmRequest;
  run: StudioTaskRunner;
  library: SpriteLibraryModel;
  draft: SpriteDraftModel;
}

interface StudioGroupsParams {
  sheet: PlayerSheet;
  busy: boolean;
  readOnly: boolean;
  dirty: boolean;
  isNew: boolean;
  draft: SpriteDraftModel;
  library: SpriteLibraryModel;
  exporter: SpriteExportModel;
  run: StudioTaskRunner;
}

interface SpriteWorkAreaProps {
  sheet: PlayerSheet;
  installed: InstalledPack | null;
  busy: boolean;
  error: string | null;
  draft: SpriteDraftModel;
  library: SpriteLibraryModel;
  exporter: SpriteExportModel;
  run: StudioTaskRunner;
  onOpenAfter: (name: string) => void;
  onUninstalled: () => void;
}

interface ViewerToolGroupsProps {
  wearing: WearingModel;
  viewer: SpriteViewerModel;
}

interface SpriteStatusProps {
  isNew: boolean;
  dirty: boolean;
  applied: boolean | null;
  readOnly: boolean;
  exportStatus: string;
  error: string | null;
}

interface SpriteStatusLine {
  tone: StatusTone;
  text: string;
}

interface SpritePropertiesProps {
  sheet: PlayerSheet;
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
  PlayerSpriteStudioProps, Slot, SpriteLibraryListProps, SpritePropertiesProps, SpriteStatusLine, SpriteStatusProps,
  SpriteWorkAreaProps, StudioActionsParams, StudioGroupsParams, ViewerToolGroupsProps,
};
