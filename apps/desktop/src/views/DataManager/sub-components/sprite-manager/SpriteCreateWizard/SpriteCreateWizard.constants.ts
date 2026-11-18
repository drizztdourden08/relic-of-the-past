/* @layer renderer-components @kind constants */
import type { SpriteWizardValues } from './SpriteCreateWizard.type';

const STEP_IDS = { rom: 'rom', extract: 'extract' } as const;

const INITIAL_VALUES: SpriteWizardValues = { romFile: '' };

export { INITIAL_VALUES, STEP_IDS };
