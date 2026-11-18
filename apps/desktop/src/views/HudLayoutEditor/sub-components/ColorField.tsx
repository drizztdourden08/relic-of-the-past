/* @layer renderer-components @kind component */
import { useRef, useState } from 'react';
import { Box, ColorSwatch, Field, TextInput } from '@drizztdourden08/tessera/primitives';
import { ColorPickerPopover } from '@drizztdourden08/tessera/color-picker-popover';
import type { ColorFieldProps } from './ColorField.type';
import { useT } from '@drizztdourden08/brock-react';

const ColorField = (props: ColorFieldProps) => {
  const t = useT();
  const { label, value, onChange, hint, disabled } = props;
  const [open, setOpen] = useState(false);
  const anchorRef = useRef<HTMLDivElement>(null);

  const body = (
    <Box ref={anchorRef} className="hud-color-field">
      <ColorSwatch
        size="sm"
        color={value}
        disabled={disabled}
        aria-label={t('hud-editor:color-field.open', { label })}
        onClick={() => setOpen(true)}
      />
      <TextInput
        size="sm"
        className="hud-color-field__hex"
        aria-label={t('hud-editor:color-field.hex', { label })}
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
