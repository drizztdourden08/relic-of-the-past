/* @layer renderer-components @kind types */
import type { I18n, Text } from '@drizztdourden08/brock-core/i18n';
import type { RomKind } from '@rotp/roms';

interface UseRomManagerParams {
  romStatuses: RomDisplayInfo[];
  onRefresh: () => void;
  onExtractAssets: (romFile: string) => Promise<boolean>;
}

interface ImportMessageParams {
  kind: RomKind;
  romFile: string;
  alreadyExists: boolean;
  t: I18n['t'];
  text: (value: Text) => string;
}

interface RomImportOutcome {
  success: boolean;
  message: string;
  id?: string;
}

export type { ImportMessageParams, RomImportOutcome, UseRomManagerParams };
