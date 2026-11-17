/* @layer renderer-components @kind types */
import type { ExtractedStatus } from '../SpriteManager.type';

interface SpriteActionsParams {
  refreshExtracted: () => Promise<void>;
}

interface ImportedSpriteListProps {
  importedRoms: readonly RomDisplayInfo[];
  extractedMap: Record<string, ExtractedStatus>;
  selectedRom: string;
  onSelect: (romFile: string) => void;
  onDelete: (romFile: string) => Promise<void>;
}

export type { ImportedSpriteListProps, SpriteActionsParams };
