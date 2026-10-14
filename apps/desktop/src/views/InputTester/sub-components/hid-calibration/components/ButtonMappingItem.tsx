/* @layer renderer-components @kind component */
import { useCallback } from 'react';
import { Box, Text, Icon, IconButton } from '@drizztdourden08/tessera/primitives';
import { InputStatusIcon } from './InputStatusIcon';
import type { ButtonMappingItemProps } from './ButtonMapping.type';

const ButtonMappingItem = (props: ButtonMappingItemProps) => {
  const { item, index, isActive, onClickItem, onClearItem } = props;
  const canClear = item.status === 'captured' || item.status === 'skipped';
  const select = useCallback(() => onClickItem(index), [onClickItem, index]);
  const clear = useCallback((e: { stopPropagation: () => void }) => { e.stopPropagation(); onClearItem(index); }, [onClearItem, index]);
  const focusClass = isActive ? ' hid-cal__input-item--focus' : '';

  return (
    <Box className={`hid-cal__input-item hid-cal__input-item--clickable hid-cal__input-item--${item.status}${focusClass}`}>
      <Text className="hid-cal__input-icon" onClick={select}><InputStatusIcon status={item.status} /></Text>
      <Text className="hid-cal__input-name" onClick={select}>{item.label}{item.kind === 'axis' && <> <Icon name="gamepad-2" /></>}</Text>
      {item.result && <Text className="hid-cal__input-result">{item.result}</Text>}
      {canClear && (
        <IconButton variant="ghost" tone="danger" size="xs" className="hid-cal__input-clear" label={`Clear ${item.label}`} onClick={clear}>
          <Icon name="x" />
        </IconButton>
      )}
    </Box>
  );
};

export { ButtonMappingItem };
