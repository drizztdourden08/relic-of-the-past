/* @layer renderer-components @kind component */
/**
 * A `glyph` element shows a fixed position, or "whatever slot N is bound to right
 * now" (never both). Picked visually from the same grid the toolbar's own
 * Glyph insert uses, never typed by an SDL name.
 *
 * THE PICTURE IS THE CONTROL NOW (phase 9). This field used to print the SDL
 * token (`DPAD`, `LEFT_SHOULDER`) beside a `choose...` link, which is the
 * exact thing `GlyphPickerGrid`'s own header says it was built to stop asking:
 * "recognise a control by its SDL name instead of its picture". The grid drew
 * the artwork one click away while the field printed the identifier; both now
 * resolve through `behavior/glyph-art.ts`, so the resting field shows what the
 * picker shows.
 *
 * THE SLOT BRANCH LOST ITS PARAGRAPH. "Draws whichever glyph slot N is bound
 * to right now" was a hint that described the model instead of this field;
 * `SlotRefField` DRAWS the glyph slot N is bound to right now, which is the
 * same sentence with the reading done for you.
 */
import { useRef, useState } from 'react';
import { Box } from '@ds/primitives/Box';
import { Field } from '@ds/primitives/Field';
import { SegmentedControl } from '@ds/primitives/SegmentedControl';
import { glyphArtUrl } from '../../behavior/glyph-art';
import { useSlotScheme } from '../../behavior/slot-scheme';
import { GlyphPickerGrid } from '../GlyphPickerGrid';
import { ReferenceField } from '../ReferenceField';
import { SlotRefField } from '../SlotRefField';
import type { GlyphPack, HudElementSpec } from '@shared/types/hud';

type GlyphSpec = Extract<HudElementSpec, { type: 'glyph' }>;

interface GlyphContentProps {
  spec: GlyphSpec;
  onChange: (patch: Partial<GlyphSpec>) => void;
  glyphPacks: readonly GlyphPack[];
}

const GlyphContent = (props: GlyphContentProps) => {
  const { spec, onChange, glyphPacks } = props;
  const bySlot = spec.slot !== undefined;
  const [open, setOpen] = useState(false);
  const anchorRef = useRef<HTMLButtonElement>(null);
  const slots = useSlotScheme();

  return (
    <Box className="hud-inspect__group">
      {/* Two WORDS, not the wireframe's two phrases: "a fixed control" and
          "whatever a slot holds" overflow a 188 px rail by 32 px, which the
          width harness caught. The `shows` label carries the sentence. */}
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
export type { GlyphContentProps };
