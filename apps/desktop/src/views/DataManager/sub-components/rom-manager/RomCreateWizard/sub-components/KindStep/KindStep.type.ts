/* @layer renderer-components @kind types */
import type { RomKind } from '@rotp/roms';
import type { RomWizardValues, UpdateValues } from '../../RomCreateWizard.type';

interface KindStepProps {
  values: RomWizardValues;
  update: UpdateValues;
  onKindChange: (kind: RomKind) => void;
}

export type { KindStepProps };
