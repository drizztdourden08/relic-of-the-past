/* @layer renderer-components @kind component */
import { Field, Text, TextInput, Toggle } from '@drizztdourden08/tessera/primitives';
import { SOUND_FILTER_HINT, SOUND_FILTER_PLACEHOLDER, UNREACHABLE_DESCRIPTION } from './msu.constants';
import type { SoundPanelControlsProps } from './SoundPanelControls.type';

const SoundPanelControls = (props: SoundPanelControlsProps) => {
  const { sound, filter, showUnreachable, onFilterChange, onShowUnreachableChange } = props;
  return (
    <>
      <Field label="Find a sound" hint={SOUND_FILTER_HINT}>
        <TextInput
          type="text"
          placeholder={SOUND_FILTER_PLACEHOLDER}
          value={filter}
          onChange={(e) => onFilterChange(e.target.value)}
        />
      </Field>

      {sound.unreachableCount > 0 && (
        <Toggle
          checked={showUnreachable}
          onChange={onShowUnreachableChange}
          label="Show unreachable ids"
          description={UNREACHABLE_DESCRIPTION(sound.unreachableCount)}
        />
      )}

      {sound.statusMessage != null && (
        <Text className={`msu-status${sound.statusOk ? '' : ' msu-status--error'}`}>
          {sound.statusMessage}
        </Text>
      )}
    </>
  );
};

export { SoundPanelControls };
