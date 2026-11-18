/* @layer renderer-components @kind constants */
import type { RadioOption } from '@drizztdourden08/tessera/primitives';
import type { I18n } from '@drizztdourden08/brock-core/i18n';
import { SOURCE_ORDER } from '../CharacterCreateWizard.constants';
import type { CharacterSource } from '../CharacterCreateWizard.type';

const sourceOptionsOf = (t: I18n['t']): RadioOption<CharacterSource>[] => SOURCE_ORDER.map((value) => ({
  value,
  label: t(`views-player-sprite-studio:wizard.source.${value}.label`),
  description: t(`views-player-sprite-studio:wizard.source.${value}.description`),
}));

export { sourceOptionsOf };
