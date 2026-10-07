/* @layer renderer-components @kind component */
/**
 * One colour row: a swatch that opens the real picker, and the hex beside it.
 *
 * THIS IS THE FIRST OF THEM AND NOT THE LAST. Appearance's background, border,
 * outline, tint, text colour, text stroke and every gradient stop are the same
 * row, so it is a component instead of three lines inside the grid editor
 * that needed it first. Typing `#c064c0` is not colour picking; the swatch is
 * the control and the hex is the readout you may also type into.
 *
 * `ColorPickerPopover` owns the floating half. It portals onto the `popover`
 * layer, flips when there is no room below, and registers on the shared
 * dismiss stack, so `Escape` closes the picker, not the editor's whole
 * `FullScreenLayer`. Nothing about that is re-implemented here; this file only
 * says which swatch it is anchored to.
 *
 * THE GRID'S GUIDE COLOUR IS NO LONGER ONE OF THESE (§55). "the color picker DO
 * NOT need a separate input when we have a color picker component that already
 * has it. it's only a small square so it can live next to it, NOT STACKED." In
 * a rail where the guide swatch shares one line with the overlay toggle, the hex
 * box is the widest thing on the row and repeats a field `ColorPicker` already
 * carries, so `LayoutSettings` anchors the popover to a bare `ColorSwatch`
 * itself. Appearance's rows keep the hex: a gradient with four stops is read by
 * its numbers as much as by its squares, and those rows have a full line each.
 */
import { useRef, useState } from 'react';
import { Box } from '@ds/primitives/Box';
import { ColorSwatch } from '@ds/primitives/ColorSwatch';
import { Field } from '@ds/primitives/Field';
import { TextInput } from '@ds/primitives/TextInput';
import { ColorPickerPopover } from '@ds/composites/ColorPickerPopover';
import './HudLayoutEditor.layout.css';
import type { ReactNode } from 'react';

interface ColorFieldProps {
  label: string;
  /** `#rrggbb`. */
  value: string;
  onChange: (next: string) => void;
  hint?: ReactNode;
  disabled?: boolean;
}

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
export type { ColorFieldProps };
