/* @layer renderer-components @kind logic */
import type { I18n } from '@drizztdourden08/brock-core/i18n';
import type { RadioOption } from '@drizztdourden08/tessera/primitives';
import { sourceDescriptions, sourceLabels, SOURCE_ORDER } from '../LanguageCreateWizard.constants';
import type { LanguageSource } from '../LanguageCreateWizard.type';

const needsOwnSet = (source: LanguageSource): boolean => source === 'copy' || source === 'blank';

const sourceOptions = (hasOwnSets: boolean, t: I18n['t']): RadioOption<LanguageSource>[] =>
  SOURCE_ORDER.map((source) => ({
    value: source,
    label: sourceLabels(t)[source],
    description: sourceDescriptions(t)[source],
    disabled: !hasOwnSets && needsOwnSet(source) ? t('wizards:language.source.no-own-set') : false,
  }));

export { sourceOptions };
