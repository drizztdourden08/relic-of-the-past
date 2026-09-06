/* @layer renderer-components @kind component */
/**
 * Randomizer section of the profile-creation form: enable toggle, then seed +
 * mode, and the server fields when the online mode is picked.
 */
import { Text } from '../../../../../../design-system/primitives/Text';
import { Toggle } from '../../../../../../design-system/primitives/Toggle';
import { Select } from '../../../../../../design-system/primitives/Select';
import { TextInput } from '../../../../../../design-system/primitives/TextInput';
import { Field } from '../../../../../../design-system/primitives/Field';
import type { RandomizerFormState } from './build-randomizer-config';

interface RandomizerFieldsProps {
  value: RandomizerFormState;
  onChange: (next: RandomizerFormState) => void;
}

const MODE_OPTIONS = [
  { value: 'local', label: 'Local' },
  { value: 'online', label: 'Online' },
];

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
              placeholder="blank = random"
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
          {value.mode === 'online' && (
            <>
              <Field label="Server URL">
                <TextInput
                  type="text"
                  placeholder="archipelago.gg:38281"
                  value={value.serverUrl}
                  onChange={(e) => patch({ serverUrl: e.target.value })}
                />
              </Field>
              <Field label="Slot Name">
                <TextInput
                  type="text"
                  placeholder="Player"
                  value={value.slotName}
                  onChange={(e) => patch({ slotName: e.target.value })}
                />
              </Field>
            </>
          )}
          <Text variant="caption">Locked once the profile is created.</Text>
        </>
      )}
    </>
  );
};

export { RandomizerFields };
export type { RandomizerFieldsProps };
