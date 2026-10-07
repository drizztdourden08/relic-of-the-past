/* @layer renderer-components @kind component */
/**
 * A SLOT NUMBER, SHOWING WHAT THAT NUMBER CURRENTLY DRAWS.
 *
 * Three fields asked for a slot number as a bare spinner and each repeated the
 * same paragraph under it that said "any number, not capped, not validated
 * against a device" (the `slot` element, `glyph` by slot, a `button`'s slot
 * bind). That sentence is a POLICY STATEMENT, not a field hint: it is true of
 * every slot number in the project and it never changes, so printing it three
 * times per panel taught nobody anything. All three are this control now, and
 * the disclaimer is gone from all three.
 *
 * THE POLICY IS UNCHANGED AND IS ENFORCED BY SAYING NOTHING. The number is
 * still uncapped, still 1-based, still never checked against a device. What
 * replaces the paragraph is a CONSEQUENCE, and only when there is one: a
 * number past the previewed scheme's list draws an empty frame and says so, in
 * one line, at the field where it was typed instead of as a note on an
 * outline row three panels away. A number the scheme HAS says nothing at all.
 * It just shows the glyph, which is the answer the paragraph was gesturing at.
 *
 * IT PREVIEWS THE GLYPH, NEVER THE ITEM, at all three call sites. That includes
 * the `slot` ELEMENT, which draws an item. A slot's glyph is a fact about the
 * scheme and is stable; the item on it is a per-save ASSIGNMENT, and the
 * editor's own preview deals every placeholder a RANDOM item on purpose
 * (`useSampleState`'s header: a live save would draw two sprites and eight
 * blanks, which says nothing). Previewing a dealt item as "what slot 3 holds"
 * would be the one number in this field that changes when nothing changed.
 *
 * BUILT ON `SlotPickerPanel`, which the inspector had never once opened.
 * It existed for the toolbar's Slot insert alone while three inspector fields
 * hand-rolled a spinner beside it.
 *
 * REUSABLE ON PURPOSE (§40). Phase 8's `dim when empty` chips ask the same
 * question about the same numbers, so this takes props, owns no store, and
 * lives beside `ValueField` instead of inside `content/`.
 */
import './HudLayoutEditor.content.css';
import { useRef, useState } from 'react';
import { Text } from '@ds/primitives/Text';
import { glyphArtUrl } from '../behavior/glyph-art';
import { slotInScheme, slotPositionOf } from '../behavior/slot-scheme';
import { ReferenceField } from './ReferenceField';
import { SlotPickerPanel } from './SlotPickerPanel';
import type { ModernSlot } from '@shared/types/controls';
import type { GlyphPack } from '@shared/types/hud';

interface SlotRefFieldProps {
  label?: string;
  value: number;
  onChange: (index: number) => void;
  /** The previewed scheme's slots. Empty means nothing is previewed, which is
   *  not the same as "this number is wrong". */
  slots: readonly ModernSlot[];
  glyphPacks: readonly GlyphPack[];
  className?: string;
}

const SlotRefField = (props: SlotRefFieldProps) => {
  const { label = 'slot', value, onChange, slots, glyphPacks, className = '' } = props;
  const [open, setOpen] = useState(false);
  const anchorRef = useRef<HTMLButtonElement>(null);

  const position = slotPositionOf(slots, value);
  const known = slotInScheme(slots, value);
  // Nothing previewed is not the same as out of range: with no scheme in hand
  // there is no claim to make about any number, so no note is drawn.
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
export type { SlotRefFieldProps };
