/* @layer renderer-components @kind component */
/**
 * A `text` element is a string or a number, drawn in the game's own extracted
 * glyphs or a real font. A "counter" is this with a numeric `value` and
 * zero-padding already set. That is the toolbar's own Counter button, not a second
 * kind (`hud-text.ts`'s own header).
 *
 * THE OUTER `text | ƒx` SWITCH IS GONE, AND IT WAS DESTRUCTIVE (phase 9).
 * Choosing `text` on a value that held a formula wrote `''` over it; choosing
 * `data` on a string wrote `{ from: 'data', expr: '0' }` over that. Nothing
 * warned and nothing undid it, while the `ValueField` the switch wrapped went
 * to real trouble to preserve exactly the thing the switch above it threw
 * away. `TextValueField` is one field with one rule: a leading `=` makes it a
 * formula and is never stored, `==` escapes a literal `=`.
 *
 * DIGITS AND PAD NOW FOLLOW THE PROPERTY THEY QUALIFY, not the old switch.
 * `hud-text.ts` says they are "meaningful only when `value` resolves to a
 * number", which is true of a bound expression AND of a typed numeral, and was
 * never true of the `data` mode specifically.
 */
// The face specimen below is `.hud-ref-field__specimen`; this row would
// otherwise depend on `FontPicker` happening to be imported to bring the sheet.
import '../HudLayoutEditor.content.css';
import { Box } from '@ds/primitives/Box';
import { Field } from '@ds/primitives/Field';
import { Flex } from '@ds/primitives/Flex';
import { NumberInput } from '@ds/primitives/NumberInput';
import { SegmentedControl } from '@ds/primitives/SegmentedControl';
import { Select } from '@ds/primitives/Select';
import { Text } from '@ds/primitives/Text';
import { Toggle } from '@ds/primitives/Toggle';
import { FontPicker } from '../FontPicker';
import { PaintField } from '../PaintField';
import { ValueField } from '../ValueField';
import { TextValueField } from './TextValueField';
import type { HudElementSpec, HudTextAlign, HudTextPad, HudTextSpriteSet } from '@shared/types/hud';

type TextSpec = Extract<HudElementSpec, { type: 'text' }>;

interface TextContentProps {
  spec: TextSpec;
  onChange: (patch: Partial<TextSpec>) => void;
  scope: Readonly<Record<string, number>>;
  insideRepeat?: boolean;
}

const ALIGNS: readonly HudTextAlign[] = ['start', 'center', 'end'];
const PADS: readonly HudTextPad[] = ['none', 'zero', 'space'];

/** The two extracted sheets, and what each of them can actually draw. The
 *  digits-only limit is knowledge the editor has had all along and has never
 *  once said (`hud-text.ts`: "the HUD's own digits, no letters"). */
const SPRITE_SETS: readonly { value: HudTextSpriteSet; label: string; specimen: string; warn?: string }[] = [
  { value: 'hud-digits', label: 'HUD digits', specimen: '07', warn: 'This face has digits only. Letters will not draw.' },
  { value: 'pause-letters', label: 'Pause letters', specimen: 'Ab', warn: undefined },
];

const TextContent = (props: TextContentProps) => {
  const { spec, onChange, scope, insideRepeat } = props;
  // `format` qualifies a value that RESOLVES to a number: an expression, or a
  // typed numeral. A plain string ignores it, so it is not offered for one.
  const numeric = typeof spec.value !== 'string';
  const face = spec.face;
  const set = face.from === 'sprite' ? SPRITE_SETS.find((entry) => entry.value === face.set) : undefined;

  return (
    <Box className="hud-inspect__group">
      <TextValueField value={spec.value} onChange={(value) => onChange({ value })} scope={scope} insideRepeat={insideRepeat} />

      {numeric && (
        <Box className="hud-inspect__row">
          <Field size="sm" label="digits" className="hud-inspect__extent">
            <NumberInput size="sm" aria-label="Digits" min={1} step={1} value={spec.format?.digits ?? 1} onChange={(digits) => onChange({ format: { ...spec.format, digits } })} />
          </Field>
          <Field size="sm" label="pad" className="hud-inspect__extent">
            <Select size="sm" value={spec.format?.pad ?? 'none'} options={PADS.map((p) => ({ value: p, label: p }))} onChange={(pad) => onChange({ format: { ...spec.format, pad: pad as HudTextPad } })} />
          </Field>
        </Box>
      )}

      <Field size="sm" label="face">
        <SegmentedControl
          size="sm"
          value={spec.face.from}
          options={[{ value: 'sprite', label: 'game sprite' }, { value: 'font', label: 'font' }]}
          onChange={(v) => onChange({ face: v === 'sprite' ? { from: 'sprite', set: 'hud-digits' } : { from: 'font', family: 'sans', size: 16 } })}
        />
      </Field>
      {spec.face.from === 'sprite' ? (
        <Field size="sm" label="sprite set" hint={set?.warn ? <Text className="hud-text-face__warn">{set.warn}</Text> : undefined}>
          <Flex gap="2xs" align="center">
            <Text className="hud-ref-field__specimen">{set?.specimen ?? '??'}</Text>
            <Select size="sm" value={spec.face.set} options={SPRITE_SETS.map((s) => ({ value: s.value, label: s.label }))} onChange={(next) => onChange({ face: { from: 'sprite', set: next as HudTextSpriteSet } })} />
          </Flex>
        </Field>
      ) : (
        <FontPicker family={spec.face.family} size={spec.face.size} weight={spec.face.weight} onChange={(family, size, weight) => onChange({ face: { from: 'font', family, size, weight } })} />
      )}

      <PaintField label="colour" value={spec.color ?? '#ffffff'} onChange={(color) => onChange({ color })} scope={scope} insideRepeat={insideRepeat} />

      <Toggle size="sm" checked={spec.stroke !== undefined} label="Stroke" onChange={(on) => onChange({ stroke: on ? { width: 1, color: 'var(--game-stroke)' } : undefined })} />
      {spec.stroke && (
        <Flex direction="column" gap="2xs" className="hud-inspect__nested">
          <ValueField label="width" value={spec.stroke.width} onChange={(width) => onChange({ stroke: { ...spec.stroke, width } as TextSpec['stroke'] })} scope={scope} insideRepeat={insideRepeat} min={0} />
          <PaintField label="colour" value={spec.stroke.color} onChange={(color) => onChange({ stroke: { ...spec.stroke, color } as TextSpec['stroke'] })} scope={scope} insideRepeat={insideRepeat} />
        </Flex>
      )}

      <Box className="hud-inspect__row">
        <Field size="sm" label="align" className="hud-inspect__extent">
          <Select size="sm" value={spec.align ?? 'start'} options={ALIGNS.map((a) => ({ value: a, label: a }))} onChange={(align) => onChange({ align: align as HudTextAlign })} />
        </Field>
        <Field size="sm" label="tracking" className="hud-inspect__extent">
          {/* NOT a `Slider`: `tracking` is extra letter-spacing in SNES px and
              the model declares no bound for it at any layer. `hud-text.ts`
              has no range, `validate-text-node.ts` only asks that it be a
              number, and the renderer never clamps it. A slider needs two
              ends, and inventing them here would be the panel asserting a rule
              the document does not have. */}
          <NumberInput size="sm" aria-label="Tracking" step={1} disabled={spec.face.from === 'sprite'} value={spec.tracking ?? 0} onChange={(tracking) => onChange({ tracking: tracking === 0 ? undefined : tracking })} />
        </Field>
      </Box>
    </Box>
  );
};

export { TextContent };
export type { TextContentProps };
