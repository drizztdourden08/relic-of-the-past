/* @layer renderer-components @kind types */
import type { ExtractedStatus } from '../../../../SpriteManager.type';
import type { SpriteWizardApi } from '../../SpriteCreateWizard.type';

interface RomStepProps {
  values: SpriteWizardApi['values'];
  update: SpriteWizardApi['update'];
  roms: readonly RomDisplayInfo[];
  extractedMap: Record<string, ExtractedStatus>;
}

export type { RomStepProps };
