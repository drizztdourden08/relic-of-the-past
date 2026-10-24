/* @layer renderer-components @kind component */
import { useEffect } from 'react';
import { Text, Toggle, Select, TextInput, Field } from '@drizztdourden08/tessera/primitives';
import { ArchipelagoFields } from './ArchipelagoFields';
import { ArchipeliaFields } from './ArchipeliaFields';
import { MODE_OPTIONS } from './RandomizerFields.constants';
import type { RandomizerFormState } from './build-randomizer-config';
import type { RandomizerFieldsProps } from './RandomizerFields.type';

const RandomizerFields = (props: RandomizerFieldsProps) => {
  const { value, onChange, experimental, joining } = props;
  const patch = (part: Partial<RandomizerFormState>) => onChange({ ...value, ...part });

  useEffect(() => {
    if (!experimental && value.mode === 'online') onChange({ ...value, mode: 'local' });
  }, [experimental, value, onChange]);

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
              options={experimental ? MODE_OPTIONS : MODE_OPTIONS.filter((option) => option.value !== 'online')}
            />
          </Field>
          {experimental && value.mode === 'online' && <ArchipelagoFields value={value} onChange={patch} />}
          {value.mode === 'archipelia' && <ArchipeliaFields value={value} onChange={patch} joining={joining} />}
          <Text variant="caption">
            {experimental && value.mode === 'online'
              ? 'Seed and options lock once the profile is created. The connection stays editable.'
              : 'Locked once the profile is created.'}
          </Text>
        </>
      )}
    </>
  );
};

export { RandomizerFields };
