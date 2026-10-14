/* @layer renderer-components @kind types */
import type { ImportProgressState } from '@app/hooks/useImportProgress';
import type { ExtractedStatus } from '../SpriteManager.type';

interface SpriteMessage {
  type: 'success' | 'error';
  text: string;
}

interface SpriteActionsParams {
  toExtract: string;
  setToExtract: (romFile: string) => void;
  setSelectedRom: (romFile: string) => void;
  refreshExtracted: () => Promise<void>;
}

interface SpriteExtractPanelProps {
  availableRoms: readonly RomDisplayInfo[];
  hasAnyRom: boolean;
  toExtract: string;
  onToExtractChange: (romFile: string) => void;
  busy: boolean;
  message: SpriteMessage | null;
  progress: ImportProgressState;
  onExtract: () => Promise<void>;
}

interface ImportedSpriteListProps {
  importedRoms: readonly RomDisplayInfo[];
  extractedMap: Record<string, ExtractedStatus>;
  selectedRom: string;
  onSelect: (romFile: string) => void;
  onDelete: (romFile: string) => Promise<void>;
}

export type { ImportedSpriteListProps, SpriteActionsParams, SpriteExtractPanelProps, SpriteMessage };
