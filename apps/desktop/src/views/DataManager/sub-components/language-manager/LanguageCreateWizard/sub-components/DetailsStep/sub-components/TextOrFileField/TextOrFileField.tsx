/* @layer renderer-components @kind component */
import { useT } from '@drizztdourden08/brock-react';
import { Field, SegmentedControl, Stack, Textarea } from '@drizztdourden08/tessera/primitives';
import { UploadField } from '@app/compounds/UploadField';
import { EMPTY_TEXT_OR_FILE, LICENSE_ACCEPT, textOrFileOptions } from '../../../../LanguageCreateWizard.constants';
import type { TextOrFileFieldProps } from './TextOrFileField.type';

const TextOrFileField = ({ label, hint, dropLabel, value, onChange }: TextOrFileFieldProps) => {
  const t = useT();
  const readFile = async (files: File[]) => {
    const file = files[0];
    if (file) onChange({ mode: 'file', text: await file.text(), fileName: file.name });
  };
  return (
    <Field label={label} hint={hint}>
      <Stack gap="sm">
        <SegmentedControl
          size="sm"
          value={value.mode}
          options={[...textOrFileOptions(t)]}
          onChange={(mode) => onChange({ ...EMPTY_TEXT_OR_FILE, mode })}
        />
        {value.mode === 'text' ? (
          <Textarea value={value.text} onChange={(e) => onChange({ ...value, text: e.currentTarget.value })} rows={3} resize="vertical" />
        ) : (
          <UploadField accept={LICENSE_ACCEPT} label={dropLabel}
            status={value.fileName ? { tone: 'success', message: value.fileName } : undefined}
            onFiles={(files) => void readFile(files)} />
        )}
      </Stack>
    </Field>
  );
};

export { TextOrFileField };
