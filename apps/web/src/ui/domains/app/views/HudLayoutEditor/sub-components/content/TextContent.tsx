/* @layer renderer-components @kind component */
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
import { ALIGNS, PADS, SPRITE_SETS } from './TextContent.constants';
import type { HudTextAlign, HudTextPad, HudTextSpriteSet } from '@shared/types/hud';
import type { TextContentProps, TextSpec } from './TextContent.type';

const TextContent = (props: TextContentProps) => {
  const { spec, onChange, scope, insideRepeat } = props;
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
          <NumberInput size="sm" aria-label="Tracking" step={1} disabled={spec.face.from === 'sprite'} value={spec.tracking ?? 0} onChange={(tracking) => onChange({ tracking: tracking === 0 ? undefined : tracking })} />
        </Field>
      </Box>
    </Box>
  );
};

export { TextContent };
export type { TextContentProps } from './TextContent.type';
