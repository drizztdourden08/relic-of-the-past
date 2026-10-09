/* @layer renderer-components @kind component */
import { Text } from '../../../../../../design-system/primitives/Text';
import { Toggle } from '../../../../../../design-system/primitives/Toggle';
import { Select } from '../../../../../../design-system/primitives/Select';
import { TextInput } from '../../../../../../design-system/primitives/TextInput';
import { Field } from '../../../../../../design-system/primitives/Field';
import { ArchipelagoFields } from './ArchipelagoFields';
import { MODE_OPTIONS } from './RandomizerFields.constants';
import type { RandomizerFormState } from './build-randomizer-config';
import type { RandomizerFieldsProps } from './RandomizerFields.type';

const RandomizerFields = (props: RandomizerFieldsProps) => {
  const { value, onChange } = props;
  const patch = (part: Partial<RandomizerFormState>) => onChange({ ...value, ...part });

  return (
    <>
      <Toggle
        label="Randomizer"
        checked={value.enabled}
        onChange={(enabled) => patch({ enabled })}
      />
      {value.enabled && (
        <>
          <Field label="Seed">
            <TextInput
              type="text"
              placeholder="a seed is required"
              value={value.seed}
              onChange={(e) => patch({ seed: e.target.value })}
            />
          </Field>
          <Field label="Mode">
            <Select
              value={value.mode}
              onChange={(mode) => patch({ mode: mode as RandomizerFormState['mode'] })}
              options={MODE_OPTIONS}
            />
          </Field>
          {value.mode === 'online' && <ArchipelagoFields value={value} onChange={patch} />}
          <Text variant="caption">
            {value.mode === 'online'
              ? 'Seed and options lock once the profile is created. The connection stays editable.'
              : 'Locked once the profile is created.'}
          </Text>
        </>
      )}
    </>
  );
};

export { RandomizerFields };
