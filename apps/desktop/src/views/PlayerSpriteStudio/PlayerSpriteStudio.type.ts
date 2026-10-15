/* @layer renderer-components @kind types */
import type { OutfitId, PlayerSheet, SheetMeta } from '@rotp/game-data';
import type { InstalledPack } from '@rotp/hub-contracts';
import type { useWearing } from '@rotp/design/packs';
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
  selected: string | null;
  canCreate: boolean;
  isInstalled: (name: string) => boolean;
  onSelect: (name: string) => void;
  onCreate: () => void;
  onDelete: (name: string) => void;
  onUrlImport: (url: string) => Promise<{ success: boolean; message: string }>;
  onFileImport: (files: File[]) => Promise<{ success: boolean; message: string }>;
}

interface StudioToolbarProps {
  meta: SheetMeta;
  file: string | null;
  dirty: boolean;
  applied: boolean | null;
  busy: boolean;
  readOnly: boolean;
  onMeta: (meta: SheetMeta) => void;
  onSave: () => void;
  onSaveAs: (container: 'zspr' | 'rsp') => void;
  onExport: (container: 'zspr' | 'rsp') => void;
  onRevert: () => void;
  onClose: () => void;
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

interface StudioDetailProps {
  sheet: PlayerSheet;
  openFile: string | null;
  installed: InstalledPack | null;
  busy: boolean;
  status: string | null;
  draft: SpriteDraftModel;
  library: SpriteLibraryModel;
  exporter: SpriteExportModel;
  wearing: WearingModel;
  run: (task: () => Promise<unknown>) => Promise<void>;
  onOpenAfter: (name: string) => void;
  onUninstalled: () => void;
}

interface ApplyRowProps {
  applied: boolean | null;
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
  ApplyRowProps, Container, GloveSwatchGridProps, LibraryEntry, OpenDraft, OutfitSwatchGridProps, PaletteEditorProps,
  PlayerSpriteStudioProps, Slot, SpriteLibraryListProps, StudioActionsParams, StudioDetailProps, StudioToolbarProps,

};
