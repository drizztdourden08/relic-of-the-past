/* @layer renderer-components @kind types */
import type { useRomExtraction } from './useRomExtraction';

type RomExtraction = ReturnType<typeof useRomExtraction>;

type ExtractRom = (romFile: string) => Promise<boolean>;

interface UseRomExtractionParams {
  onExtractAssets: ExtractRom;
}

interface ExtractionOptionsProps {
  extraction: RomExtraction;
}

export type { ExtractionOptionsProps, ExtractRom, RomExtraction, UseRomExtractionParams };
