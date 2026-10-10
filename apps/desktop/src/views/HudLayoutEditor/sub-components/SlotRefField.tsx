/* @layer renderer-components @kind component */
import { useRef, useState } from 'react';
import { Text } from '@drizztdourden08/tessera/primitives';
import { glyphArtUrl } from '@app/hud-layout-editing/glyph-art';
import { slotInScheme, slotPositionOf } from '@app/hud-layout-editing/slot-scheme';
import { ReferenceField } from './ReferenceField';
import { SlotPickerPanel } from './SlotPickerPanel';
import type { SlotRefFieldProps } from './SlotRefField.type';

const SlotRefField = (props: SlotRefFieldProps) => {
  const { label = 'slot', value, onChange, slots, glyphPacks, className = '' } = props;
  const [open, setOpen] = useState(false);
  const anchorRef = useRef<HTMLButtonElement>(null);

  const position = slotPositionOf(slots, value);
  const known = slotInScheme(slots, value);
  const highest = slots.reduce((top, slot) => Math.max(top, slot.index), 0);
  const note = slots.length > 0 && !known
    ? `The previewed scheme reaches slot ${highest}, so this draws nothing here. Still legal.`
    : undefined;

  return (
    <ReferenceField
      label={label}
      className={`hud-slot-ref ${className}`}
      src={position ? glyphArtUrl(glyphPacks, undefined, position) : undefined}
      placeholder="▫"
      name={`Slot ${value}`}
      kind={position ?? (known ? 'no glyph' : undefined)}
      onOpen={() => setOpen(true)}
      anchorRef={anchorRef}
      aria-label={`${label} ${value}`}
      hint={note ? <Text className="hud-slot-ref__note">{note}</Text> : undefined}
    >
      <SlotPickerPanel
        open={open}
        anchorRef={anchorRef}
        slotNumbers={slots.map((slot) => slot.index)}
        onClose={() => setOpen(false)}
        onPickNumber={(index) => { if (Number.isInteger(index) && index > 0) onChange(index); }}
      />
    </ReferenceField>
  );
};

export { SlotRefField };
export type { SlotRefFieldProps } from './SlotRefField.type';
