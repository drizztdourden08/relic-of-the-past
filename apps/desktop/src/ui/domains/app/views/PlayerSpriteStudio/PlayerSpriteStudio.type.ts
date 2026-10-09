/* @layer renderer-components @kind types */
import type { OutfitId, PlayerSheet, SheetMeta } from '@shared/game/data/player-sheet/types';
import type { RomDisplayInfo } from '@app/views/GameSession/GameSession.type';

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

export type {
  Container, LibraryEntry, OpenDraft, PaletteEditorProps, PlayerSpriteStudioProps, Slot, SpriteLibraryListProps,
  StudioToolbarProps,
};
