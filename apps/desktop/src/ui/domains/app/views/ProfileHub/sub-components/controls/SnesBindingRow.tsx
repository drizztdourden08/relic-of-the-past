/* @layer renderer-components @kind component */
import { useCallback } from 'react';
import { SNES_ACTION_LABELS, SNES_BUTTON_LABELS } from '@rotp/game-data';
import { getSnesIconUrl } from '@app/lib/input/button-icons';
import { BindingRow } from './BindingRow';
import type { SnesBindingRowProps } from './controls.type';

const SnesBindingRow = (props: SnesBindingRowProps) => {
  const { snesButton, binding, bindingIcon, deviceIconUrl, onRebind, onClear } = props;
  const handleRebind = useCallback(() => onRebind(snesButton), [onRebind, snesButton]);
  const handleClear = useCallback(() => onClear(snesButton), [onClear, snesButton]);
  return (
    <BindingRow
      actionLabel={SNES_ACTION_LABELS[snesButton]}
      middleLabel={SNES_BUTTON_LABELS[snesButton]}
      middleIconUrl={getSnesIconUrl(snesButton)}
      binding={binding}
      bindingIcon={bindingIcon}
      deviceIconUrl={deviceIconUrl}
      onRebind={handleRebind}
      onClear={handleClear}
    />
  );
};

export { SnesBindingRow };
