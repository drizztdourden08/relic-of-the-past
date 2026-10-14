/* @layer renderer-components @kind types */
import type { useValueInput } from '../behavior/useValueInput';

interface ValueInputRowProps {
  field: ReturnType<typeof useValueInput>;
  label?: string;
  ariaLabel?: string;
  placeholder?: string;
  readOnly: boolean;
  invalid: boolean;
}

export type { ValueInputRowProps };
