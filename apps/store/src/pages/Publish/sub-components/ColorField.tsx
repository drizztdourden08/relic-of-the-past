/* @layer store-site @kind component */
import { useRef, useState } from 'react';
import { ColorPickerPopover } from '@ds/composites/ColorPickerPopover';
import { ColorSwatch } from '@ds/primitives/ColorSwatch';
import { Field } from '@ds/primitives/Field';
import { DEFAULT_ITEM_COLOR } from '@shared/store/item-color';
import { FIELD_LABELS } from '../Publish.constants';
import type { ColorFieldProps } from './ColorField.type';

const ColorField = (props: ColorFieldProps) => {
  const { value, onChange } = props;
  const [open, setOpen] = useState(false);
  const anchorRef = useRef<HTMLElement | null>(null);
  return (
    <Field label={FIELD_LABELS.color} className="publish__color">
      <ColorSwatch
        color={value}
        selected={open}
        edited={value.toLowerCase() !== DEFAULT_ITEM_COLOR}
        title={value}
        onClick={(event) => {
          anchorRef.current = event.currentTarget;
          setOpen((current) => !current);
        }}
      />
      <ColorPickerPopover
        open={open}
        anchorRef={anchorRef}
        value={value}
        onChange={onChange}
        disableAlpha
        title="Item colour"
        original={DEFAULT_ITEM_COLOR}
        onReset={() => onChange(DEFAULT_ITEM_COLOR)}
        onClose={() => setOpen(false)}
      />
    </Field>
  );
};

export { ColorField };
