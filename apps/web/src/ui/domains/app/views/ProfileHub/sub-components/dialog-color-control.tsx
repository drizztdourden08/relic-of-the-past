/* @layer renderer-components @kind component */
/**
 * A settings row for one hex colour: the label and description on the left, a swatch on the
 * right that opens the colour picker beside it.
 */
import { useRef, useState } from 'react';
import { Flex } from '../../../../../design-system/primitives/Flex';
import { Text } from '../../../../../design-system/primitives/Text';
import { ColorSwatch } from '../../../../../design-system/primitives/ColorSwatch';
import { ColorPickerPopover } from '../../../../../design-system/composites/ColorPickerPopover';
import './dialog-color-control.css';

interface DialogColorControlProps {
  label: string;
  description: string;
  /** Current colour, `#rrggbb`. */
  value: string;
  /** The value a fresh profile carries, offered as the picker's reset target. */
  original: string;
  onChange: (hex: string) => void;
  disabled?: boolean;
}

const DialogColorControl = (props: DialogColorControlProps) => {
  const { label, description, value, original, onChange, disabled = false } = props;
  const [open, setOpen] = useState(false);
  const anchorRef = useRef<HTMLElement | null>(null);

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
        onClick={(e) => {
          anchorRef.current = e.currentTarget;
          setOpen((cur) => !cur);
        }}
      />
      <ColorPickerPopover
        open={open}
        anchorRef={anchorRef}
        value={value}
        onChange={onChange}
        disableAlpha
        title={label}
        original={original}
        onReset={() => onChange(original)}
        onClose={() => setOpen(false)}
      />
    </Flex>
  );
};

export { DialogColorControl };
export type { DialogColorControlProps };
