/* @layer renderer-components @kind logic */
import type { I18n } from '@drizztdourden08/brock-core/i18n';
import { DEFAULT_ACCEPT } from '../ImportForm.constants';
import type { ImportFormProps, ImportFormSettings } from '../ImportForm.type';

const withImportDefaults = (props: ImportFormProps, t: I18n['t']): ImportFormSettings => ({
  ...props,
  placeholder: props.placeholder ?? t('data-manager:import.placeholder'),
  accept: props.accept ?? DEFAULT_ACCEPT,
  dropLabel: props.dropLabel ?? t('data-manager:import.drop-label'),
  disabled: props.disabled ?? false,
});

export { withImportDefaults };
