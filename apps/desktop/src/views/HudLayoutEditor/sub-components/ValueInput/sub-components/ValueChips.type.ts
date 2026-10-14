/* @layer renderer-components @kind types */
import type { useValueInput } from '../behavior/useValueInput';

interface ValueChipsProps {
  field: ReturnType<typeof useValueInput>;
}

export type { ValueChipsProps };
