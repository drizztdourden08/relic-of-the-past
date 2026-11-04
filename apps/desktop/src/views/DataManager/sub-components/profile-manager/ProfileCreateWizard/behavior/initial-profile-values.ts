/* @layer renderer-components @kind logic */
import { freshRandomizerForm } from '../../build-randomizer-config';
import type { ProfileWizardValues } from '../ProfileCreateWizard.type';

const initialProfileValues = (): ProfileWizardValues => ({
  name: '',
  rom: '',
  preset: 'enhanced',
  language: '',
  msuPack: '',
  randomizer: freshRandomizerForm(),
});

export { initialProfileValues };
