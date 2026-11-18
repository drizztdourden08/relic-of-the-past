/* @layer renderer-components @kind constants */
import type { I18n } from '@drizztdourden08/brock-core/i18n';
import type { SelectOption } from '@drizztdourden08/tessera/primitives';

const modeOptions = (t: I18n['t']): readonly SelectOption[] => [
  { value: 'vanilla', label: t('compounds:capacity.mode.vanilla') },
  { value: 'vanilla-in-pool', label: t('compounds:capacity.mode.vanilla-in-pool') },
  { value: 'custom', label: t('compounds:capacity.mode.custom') },
];

const walletModeOptions = (t: I18n['t']): readonly SelectOption[] => modeOptions(t).filter((option) => option.value !== 'vanilla-in-pool');

export { modeOptions, walletModeOptions };
