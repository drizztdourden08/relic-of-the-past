/* @layer renderer-components @kind logic */
import { DEFAULT_ACCEPT, DEFAULT_DROP_LABEL, DEFAULT_PLACEHOLDER } from '../ImportForm.constants';
import type { ImportFormProps, ImportFormSettings } from '../ImportForm.type';

const withImportDefaults = (props: ImportFormProps): ImportFormSettings => ({
  ...props,
  placeholder: props.placeholder ?? DEFAULT_PLACEHOLDER,
  accept: props.accept ?? DEFAULT_ACCEPT,
  dropLabel: props.dropLabel ?? DEFAULT_DROP_LABEL,
  disabled: props.disabled ?? false,
});

export { withImportDefaults };
