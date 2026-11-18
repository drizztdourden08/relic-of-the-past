/* @layer renderer-components @kind component */
import { Field, Stack, TextInput } from '@drizztdourden08/tessera/primitives';
import { UploadField } from '@app/compounds/UploadField';
import type { DropZoneStatus } from '@drizztdourden08/tessera/primitives';
import { MSU_PACK_ACCEPT, NAME_HINT } from '../MsuCreateWizard.constants';
import type { FieldsProps } from '../MsuCreateWizard.type';

const chosenStatus = (file: File | null): DropZoneStatus | undefined =>
  (file === null ? undefined : { tone: 'success', message: file.name });

const DetailsStep = ({ values, update }: FieldsProps) => (
  <Stack gap="md">
    <Field label="Pack name" hint={NAME_HINT}>
      <TextInput
        type="text"
        placeholder="My Music Pack"
        value={values.name}
        onChange={(e) => update({ name: e.currentTarget.value })}
      />
    </Field>
    {values.source === 'file' && (
      <Field label="Pack file">
        <UploadField
          accept={[...MSU_PACK_ACCEPT]}
          label="Drop a pack here"
          hint=".msul, or a .zip / .7z / .rar archive of audio"
          status={chosenStatus(values.file)}
          onFiles={(files) => update({ file: files[0] ?? null })}
        />
      </Field>
    )}
    {values.source === 'url' && (
      <Field label="Download link">
        <TextInput
          type="text"
          placeholder="Paste pack download URL..."
          value={values.url}
          onChange={(e) => update({ url: e.currentTarget.value })}
        />
      </Field>
    )}
  </Stack>
);

export { DetailsStep };
