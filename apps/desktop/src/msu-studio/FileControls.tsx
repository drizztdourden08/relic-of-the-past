/* @layer renderer-components @kind component */
import { Checkbox, DropZone, Field, Text, TextInput } from '@drizztdourden08/tessera/primitives';
import { AUDIO_ACCEPT, AUDIO_ACCEPT_HINT } from './msu.constants';
import type { FileControlsProps } from './FileControls.type';

const FileControls = (props: FileControlsProps) => {
  const { panel, coveredCount, supersededOnly, readOnly, onSupersededOnlyChange } = props;
  return (
    <>
      <DropZone
        accept={AUDIO_ACCEPT}
        label="Drop audio here to add it to the pack"
        hint={AUDIO_ACCEPT_HINT}
        disabled={panel.busy || readOnly}
        onDrop={panel.handleUpload}
      />

      <Field label="Find a file" hint="Matches the name, or a format on its own.">
        <TextInput
          type="text"
          placeholder="intro, pcm..."
          value={panel.filter}
          onChange={(event) => panel.setFilter(event.target.value)}
        />
      </Field>

      {coveredCount > 0 && (
        <Checkbox
          checked={supersededOnly}
          label={`Superseded originals only (${coveredCount})`}
          onChange={onSupersededOnlyChange}
        />
      )}

      {panel.statusMessage != null && (
        <Text className={`msu-status${panel.statusOk ? '' : ' msu-status--error'}`}>
          {panel.statusMessage}
        </Text>
      )}
    </>
  );
};

export { FileControls };
