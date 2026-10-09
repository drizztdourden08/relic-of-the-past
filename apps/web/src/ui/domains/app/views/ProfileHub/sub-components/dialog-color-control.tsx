/* @layer renderer-components @kind component */
import { useCallback, useRef, useState } from 'react';
import type { MouseEvent } from 'react';
import { Flex } from '../../../../../design-system/primitives/Flex';
import { Text } from '../../../../../design-system/primitives/Text';
import { ColorSwatch } from '../../../../../design-system/primitives/ColorSwatch';
import { ColorPickerPopover } from '../../../../../design-system/composites/ColorPickerPopover';
import type { DialogColorControlProps } from './settings-controls.type';
import './dialog-color-control.css';

const DialogColorControl = (props: DialogColorControlProps) => {
  const { label, description, value, original, onChange, disabled = false } = props;
  const [open, setOpen] = useState(false);
  const anchorRef = useRef<HTMLElement | null>(null);
  const handleSwatchClick = useCallback((e: MouseEvent<HTMLElement>) => {
    anchorRef.current = e.currentTarget;
    setOpen((cur) => !cur);
  }, []);
  const handleReset = useCallback(() => onChange(original), [onChange, original]);
  const handleClose = useCallback(() => setOpen(false), []);

  return (
    <Flex className={`dialog-color-control${disabled ? ' dialog-color-control--disabled' : ''}`} align="center" justify="between" gap="md">
      <Flex className="dialog-color-control__text" direction="column" gap="xs">
        <Text className="dialog-color-control__label">{label}</Text>
        <Text className="dialog-color-control__description">{description}</Text>
      </Flex>
      <ColorSwatch
        color={value}
        selected={open}
        edited={value.toLowerCase() !== original.toLowerCase()}
        title={value}
        disabled={disabled}
        onClick={handleSwatchClick}
      />
      <ColorPickerPopover
        open={open}
        anchorRef={anchorRef}
        value={value}
        onChange={onChange}
        disableAlpha
        title={label}
        original={original}
        onReset={handleReset}
        onClose={handleClose}
      />
    </Flex>
  );
};

export { DialogColorControl };
export type { DialogColorControlProps };
