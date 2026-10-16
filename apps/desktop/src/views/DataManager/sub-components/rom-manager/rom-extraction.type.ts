/* @layer renderer-components @kind types */
import type { ImportProgressState } from '@app/hooks/useImportProgress';

type ExtractRom = (romFile: string) => Promise<boolean>;

interface UseRomExtractionParams {
  onExtractAssets: ExtractRom;
}

interface ExtractionOptionsProps {
  withSprites: boolean;
  onWithSpritesChange: (next: boolean) => void;
  spriteProgress: ImportProgressState;
  spriteError: string | null;
}

export type { ExtractionOptionsProps, ExtractRom, UseRomExtractionParams };
