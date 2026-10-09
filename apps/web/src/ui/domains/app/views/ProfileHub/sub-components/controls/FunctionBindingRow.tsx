/* @layer renderer-components @kind component */
import { useCallback } from 'react';
import { FUNCTION_ACTION_LABELS } from '@shared/types/controls';
import { BindingRow } from './BindingRow';
import type { FunctionBindingRowProps } from './controls.type';

const FunctionBindingRow = ({ mapping, onRebind, onClear }: FunctionBindingRowProps) => {
  const { action } = mapping;
  const handleRebind = useCallback(() => onRebind(action), [onRebind, action]);
  const handleClear = useCallback(() => onClear(action), [onClear, action]);

  return (
    <BindingRow
      actionLabel={FUNCTION_ACTION_LABELS[action]}
      binding={mapping.binding}
      bindingIcon={mapping.icon}
      deviceIconUrl={mapping.deviceIconUrl}
      onRebind={handleRebind}
      onClear={handleClear}
    />
  );
};

export { FunctionBindingRow };
