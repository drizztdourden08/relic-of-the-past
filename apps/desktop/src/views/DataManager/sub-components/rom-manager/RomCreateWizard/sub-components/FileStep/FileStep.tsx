/* @layer renderer-components @kind component */
import { DropZone, Field, Stack, TextInput } from '@drizztdourden08/tessera/primitives';
import { IMPORT_LANE_CONFIG } from '../../../import-lane-config.constants';
import type { FileStepProps } from './FileStep.type';

const FileStep = ({ values, update }: FileStepProps) => {
  const lane = IMPORT_LANE_CONFIG[values.kind];

  return (
    <Stack gap="md">
      <Field label="File">
        <DropZone
          accept={lane.accept}
          variant="inline"
          label={values.file?.name ?? lane.dropLabel}
          hint={lane.dropHint}
          status={values.file === null ? undefined : { tone: 'success', message: values.file.name }}
          onDrop={(files) => update({ file: files[0] ?? null, url: '' })}
        />
      </Field>
      <Field label="Or a download link">
        <TextInput
          type="text"
          placeholder={lane.placeholder}
          value={values.url}
          onChange={(e) => update({ url: e.currentTarget.value, file: null })}
        />
      </Field>
    </Stack>
  );
};

export { FileStep };
