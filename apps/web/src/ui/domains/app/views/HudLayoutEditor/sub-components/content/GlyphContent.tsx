/* @layer renderer-components @kind component */
import { useRef, useState } from 'react';
import { Box } from '@ds/primitives/Box';
import { Field } from '@ds/primitives/Field';
import { SegmentedControl } from '@ds/primitives/SegmentedControl';
import { glyphArtUrl } from '../../behavior/glyph-art';
import { useSlotScheme } from '../../behavior/slot-scheme';
import { GlyphPickerGrid } from '../GlyphPickerGrid';
import { ReferenceField } from '../ReferenceField';
import { SlotRefField } from '../SlotRefField';
import type { GlyphContentProps } from './GlyphContent.type';

const GlyphContent = (props: GlyphContentProps) => {
  const { spec, onChange, glyphPacks } = props;
  const bySlot = spec.slot !== undefined;
  const [open, setOpen] = useState(false);
  const anchorRef = useRef<HTMLButtonElement>(null);
  const slots = useSlotScheme();

  return (
    <Box className="hud-inspect__group">
      <Field size="sm" label="shows">
        <SegmentedControl
          size="sm"
          value={bySlot ? 'slot' : 'position'}
          options={[{ value: 'position', label: 'a control' }, { value: 'slot', label: 'a slot' }]}
          onChange={(v) => onChange(v === 'slot' ? { slot: 1, position: undefined } : { slot: undefined, position: 'DPAD' })}
        />
      </Field>
      {bySlot ? (
        <SlotRefField
          label="slot"
          value={spec.slot ?? 1}
          onChange={(slot) => onChange({ slot })}
          slots={slots}
          glyphPacks={glyphPacks}
        />
      ) : (
        <ReferenceField
          label="control"
          src={glyphArtUrl(glyphPacks, spec.pack, spec.position ?? '')}
          name={spec.position ?? '(none)'}
          kind={spec.pack}
          onOpen={() => setOpen(true)}
          anchorRef={anchorRef}
          aria-label={`Glyph: ${spec.position ?? 'none'}`}
        >
          <GlyphPickerGrid
            open={open}
            anchorRef={anchorRef}
            packs={glyphPacks}
            onClose={() => setOpen(false)}
            onPick={({ position, pack }) => onChange({ position, pack })}
          />
        </ReferenceField>
      )}
    </Box>
  );
};

export { GlyphContent };
export type { GlyphContentProps } from './GlyphContent.type';
