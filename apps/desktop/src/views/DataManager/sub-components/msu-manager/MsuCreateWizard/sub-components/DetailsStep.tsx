/* @layer renderer-components @kind component */
import { useT } from '@drizztdourden08/brock-react';
import { Field, Stack, TextInput } from '@drizztdourden08/tessera/primitives';
import { UploadField } from '@app/compounds/UploadField';
import type { DropZoneStatus } from '@drizztdourden08/tessera/primitives';
import { MSU_PACK_ACCEPT } from '../MsuCreateWizard.constants';
import type { FieldsProps } from '../MsuCreateWizard.type';

const chosenStatus = (file: File | null): DropZoneStatus | undefined =>
  (file === null ? undefined : { tone: 'success', message: file.name });

const DetailsStep = ({ values, update }: FieldsProps) => {
  const t = useT();
  return (
  <Stack gap="md">
    <Field label={t('wizards:msu.details-step.pack-name')} hint={t('wizards:msu.details-step.names-the-new-pack')}>
      <TextInput
        type="text"
        placeholder={t('wizards:msu.details-step.my-music-pack')}
        value={values.name}
        onChange={(e) => update({ name: e.currentTarget.value })}
      />
    </Field>
    {values.source === 'file' && (
      <Field label={t('wizards:msu.details-step.pack-file')}>
        <UploadField
          accept={[...MSU_PACK_ACCEPT]}
          label={t('wizards:msu.details-step.drop-a-pack-here')}
          hint={t('wizards:msu.details-step.msul-or-a-zip-7z')}
          status={chosenStatus(values.file)}
          onFiles={(files) => update({ file: files[0] ?? null })}
        />
      </Field>
    )}
    {values.source === 'url' && (
      <Field label={t('wizards:msu.details-step.download-link')}>
        <TextInput
          type="text"
          placeholder={t('wizards:msu.details-step.paste-pack-download-url')}
          value={values.url}
          onChange={(e) => update({ url: e.currentTarget.value })}
        />
      </Field>
    )}
  </Stack>
  );
};

export { DetailsStep };
