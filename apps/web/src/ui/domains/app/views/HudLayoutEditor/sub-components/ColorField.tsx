/* @layer renderer-components @kind component */
import { useRef, useState } from 'react';
import { Box } from '@ds/primitives/Box';
import { ColorSwatch } from '@ds/primitives/ColorSwatch';
import { Field } from '@ds/primitives/Field';
import { TextInput } from '@ds/primitives/TextInput';
import { ColorPickerPopover } from '@ds/composites/ColorPickerPopover';
import './HudLayoutEditor.layout.css';
import type { ColorFieldProps } from './ColorField.type';

const ColorField = (props: ColorFieldProps) => {
  const { label, value, onChange, hint, disabled } = props;
  const [open, setOpen] = useState(false);
  const anchorRef = useRef<HTMLDivElement>(null);

  const body = (
    <Box ref={anchorRef} className="hud-color-field">
      <ColorSwatch
        size="sm"
        color={value}
        disabled={disabled}
        aria-label={`Open the colour picker for ${label}`}
        onClick={() => setOpen(true)}
      />
      <TextInput
        size="sm"
        aria-label={`${label} hex`}
        value={value}
        disabled={disabled}
        onChange={(event) => onChange(event.target.value)}
      />
      <ColorPickerPopover
        open={open}
        anchorRef={anchorRef}
        value={value}
        onChange={onChange}
        onClose={() => setOpen(false)}
      />
    </Box>
  );

  return <Field size="sm" label={label} hint={hint}>{body}</Field>;
};

export { ColorField };
export type { ColorFieldProps } from './ColorField.type';
