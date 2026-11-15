/* @layer renderer-components @kind logic */
import type { ProfileWizardValues } from '../ProfileCreateWizard.type';
import { romStemOf } from './rom-stem-of';

const profileSummary = ({ name, rom }: ProfileWizardValues): string | undefined =>
  [name.trim(), romStemOf(rom)].filter((part) => part !== '').join(', ') || undefined;

export { profileSummary };
