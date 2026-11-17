/* @layer renderer-components @kind constants */
import type { RadioOption } from '@drizztdourden08/tessera/primitives';
import { SOURCE_DESCRIPTIONS, SOURCE_LABELS, SOURCE_ORDER } from '../CharacterCreateWizard.constants';
import type { CharacterSource } from '../CharacterCreateWizard.type';

const SOURCE_OPTIONS: RadioOption<CharacterSource>[] = SOURCE_ORDER.map((value) => ({
  value,
  label: SOURCE_LABELS[value],
  description: SOURCE_DESCRIPTIONS[value],
}));

export { SOURCE_OPTIONS };
