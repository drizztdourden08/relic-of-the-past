/* @layer renderer-components @kind types */
import type { CreateOutcome, WizardApi } from '@drizztdourden08/tessera/composites';
import type { ExtractedStatus } from '../../SpriteManager.type';

interface SpriteWizardValues {
  romFile: string;
}

type SpriteWizardApi = WizardApi<SpriteWizardValues>;

interface SpriteCreateWizardProps {
  roms: readonly RomDisplayInfo[];
  extractedMap: Record<string, ExtractedStatus>;
  busy: boolean;
  onExtract: (romFile: string) => Promise<CreateOutcome>;
  onCancel: () => void;
  onCreated: (id: string) => void;
}

type UseSpriteWizardParams = Pick<SpriteCreateWizardProps, 'onExtract' | 'onCreated'>;

export type { SpriteCreateWizardProps, SpriteWizardApi, SpriteWizardValues, UseSpriteWizardParams };
