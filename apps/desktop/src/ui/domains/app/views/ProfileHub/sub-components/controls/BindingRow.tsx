/* @layer renderer-components @kind component */
import { useCallback } from 'react';
import type { KeyboardEvent, MouseEvent } from 'react';
import { Box, Icon, IconButton, Text, Image } from '@drizztdourden08/tessera/primitives';
import { getBindingLabel, getBindingIconUrl } from '@app/lib/input/binding-display';
import type { BindingRowProps } from './controls.type';
import './BindingRow.css';

const BindingRow = (props: BindingRowProps) => {
  const { actionLabel, middleLabel, middleIconUrl, binding, bindingIcon, deviceIconUrl, onRebind, onClear } = props;
  const bindingLabel = getBindingLabel(binding, bindingIcon);
  const bindingIconSrc = getBindingIconUrl(binding, bindingIcon);
  const isNone = binding.type === 'none';

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onRebind(); }
  }, [onRebind]);
  const handleClear = useCallback((e: MouseEvent) => { e.stopPropagation(); onClear?.(); }, [onClear]);

  return (
    <Box
      className="binding-row"
      role="button"
      tabIndex={0}
      title={`Click to rebind ${actionLabel}`}
      onClick={onRebind}
      onKeyDown={handleKeyDown}
    >
      <Text className="binding-row__action-label">{actionLabel}</Text>

      <Box className="binding-row__icon-slot">
        {middleIconUrl ? (
          <Image src={middleIconUrl} alt={middleLabel ?? ''} className="binding-row__icon-img" />
        ) : null}
      </Box>

      <Text className="binding-row__snes-label">{middleLabel ?? ''}</Text>

      <Box className="binding-row__icon-slot">
        {bindingIconSrc ? (
          <Image src={bindingIconSrc} alt={bindingLabel} className="binding-row__icon-img" />
        ) : null}
      </Box>

      {deviceIconUrl && (
        <Box className="binding-row__device-icon-slot">
          <Image src={deviceIconUrl} alt="" className="binding-row__device-icon-img" />
        </Box>
      )}

      <Text className={`binding-row__binding-label ${isNone ? 'binding-row__binding-label--none' : ''}`}>{bindingLabel}</Text>

      {onClear && !isNone && (
        <IconButton variant="ghost" tone="danger" size="xs" className="binding-row__clear" label="Clear binding" onClick={handleClear}>
          <Icon name="x" />
        </IconButton>
      )}
    </Box>
  );
};

export { BindingRow };
