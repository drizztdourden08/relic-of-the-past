/* @layer renderer-components @kind constants */
import type { WizardStepButtons } from '@drizztdourden08/tessera/composites';
import type { ExtractedStatus } from '../../SpriteManager.type';
import type { SpriteWizardValues } from './SpriteCreateWizard.type';

const STEP_IDS = { rom: 'rom', extract: 'extract' } as const;

const STEP_LABELS = { rom: 'ROM', extract: 'Extract' } as const;

const WIZARD_TITLE = 'New sprite set';

const NO_ROMS_MESSAGE = 'No ROMs available. Import a ROM first.';

const NO_ROM_PROBLEM = 'Pick the ROM to extract sprites from.';

const BUSY_HINT = 'Extracting the sprites';

const EXTRACT_BUTTONS: WizardStepButtons = { next: { label: 'Extract sprites' } };

const INITIAL_VALUES: SpriteWizardValues = { romFile: '' };

const romLabel = (romFile: string, extractedMap: Record<string, ExtractedStatus>) =>
  extractedMap[romFile]?.extracted ? `${romFile} (has sprites)` : romFile;

export { BUSY_HINT, EXTRACT_BUTTONS, INITIAL_VALUES, NO_ROMS_MESSAGE, NO_ROM_PROBLEM, STEP_IDS, STEP_LABELS, WIZARD_TITLE, romLabel };
