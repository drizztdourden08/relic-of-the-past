/* @layer renderer-other @kind types */
import type { ProfileRandomizerConfig } from '@app/profiles/types';

declare global {
  interface Profile {
    id: string;
    name: string;
    romFile: string;
    created: number;
    lastPlayed: number;
    language?: string;
    msuPack?: string;
    automation?: boolean;
    randomizer?: ProfileRandomizerConfig;
  }

  interface AppState {
    lastProfileId: string | null;
  }

  interface ImportResult {
    success: boolean;
    romFile: string;
    error?: string;
    alreadyExists?: boolean;
  }

  interface RomInfo {
    romFile: string;
    hasAssets: boolean;
    assetSize: number | null;
  }

  type RomExtractionStatus = 'idle' | 'extracting' | 'ready' | 'failed';

  interface RomDisplayInfo extends RomInfo {
    extractionStatus: RomExtractionStatus;
  }

  function Zelda3(config: Record<string, unknown>): Promise<unknown>;
}

export {};
