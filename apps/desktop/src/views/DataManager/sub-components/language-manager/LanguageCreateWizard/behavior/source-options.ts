/* @layer renderer-components @kind logic */
import type { RadioOption } from '@drizztdourden08/tessera/primitives';
import { NO_OWN_SET_REASON, SOURCE_DESCRIPTIONS, SOURCE_LABELS, SOURCE_ORDER } from '../LanguageCreateWizard.constants';
import type { LanguageSource } from '../LanguageCreateWizard.type';

const needsOwnSet = (source: LanguageSource): boolean => source === 'copy' || source === 'blank';

const sourceOptions = (hasOwnSets: boolean): RadioOption<LanguageSource>[] =>
  SOURCE_ORDER.map((source) => ({
    value: source,
    label: SOURCE_LABELS[source],
    description: SOURCE_DESCRIPTIONS[source],
    disabled: !hasOwnSets && needsOwnSet(source) ? NO_OWN_SET_REASON : false,
  }));

export { sourceOptions };
