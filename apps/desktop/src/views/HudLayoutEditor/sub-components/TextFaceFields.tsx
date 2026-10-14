/* @layer renderer-components @kind component */
import { Field, Flex, SegmentedControl, Select, Text } from '@drizztdourden08/tessera/primitives';
import { FontPicker } from './FontPicker';
import { SPRITE_SETS } from './TextContent.constants';
import type { HudTextSpriteSet } from '@rotp/hud';
import type { TextFaceFieldsProps } from './TextFaceFields.type';

const TextFaceFields = (props: TextFaceFieldsProps) => {
  const { spec, onChange } = props;
  const { face } = spec;
  const set = face.from === 'sprite' ? SPRITE_SETS.find((entry) => entry.value === face.set) : undefined;

  return (
    <>
      <Field size="sm" label="face">
        <SegmentedControl
          size="sm"
          value={face.from}
          options={[{ value: 'sprite', label: 'game sprite' }, { value: 'font', label: 'font' }]}
          onChange={(v) => onChange({ face: v === 'sprite' ? { from: 'sprite', set: 'hud-digits' } : { from: 'font', family: 'sans', size: 16 } })}
        />
      </Field>
      {face.from === 'sprite' ? (
        <Field size="sm" label="sprite set" hint={set?.warn ? <Text className="hud-text-face__warn">{set.warn}</Text> : undefined}>
          <Flex gap="2xs" align="center">
            <Text className="hud-ref-field__specimen">{set?.specimen ?? '??'}</Text>
            <Select size="sm" value={face.set} options={SPRITE_SETS.map((s) => ({ value: s.value, label: s.label }))} onChange={(next) => onChange({ face: { from: 'sprite', set: next as HudTextSpriteSet } })} />
          </Flex>
        </Field>
      ) : (
        <FontPicker family={face.family} size={face.size} weight={face.weight} onChange={(family, size, weight) => onChange({ face: { from: 'font', family, size, weight } })} />
      )}
    </>
  );
};

export { TextFaceFields };
