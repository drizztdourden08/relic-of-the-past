/* @layer sanctuary-site @kind component */
import { useMemo } from 'react';
import { FILE_TYPES, FILE_TYPE_LABELS } from '@rotp/hub-contracts';
import { Button, Stack, Text } from '@drizztdourden08/tessera/primitives';
import { DialogShell } from '@drizztdourden08/tessera/composites';
import { formatBytes } from '@rotp/hub-client';
import { FileMetaFields } from '../FileMetaFields';
import { useUploadForm } from './behavior/useUploadForm';
import type { UploadDialogProps } from './UploadDialog.type';
import './UploadDialog.css';

const UploadDialog = (props: UploadDialogProps) => {
  const { files, types, defaultType, knownTags, onConfirm, onCancel } = props;
  const open = files.length > 0;
  const typeOptions = useMemo(
    () => FILE_TYPES.filter((t) => types.includes(t)).map((t) => ({ value: t, label: FILE_TYPE_LABELS[t] })),
    [types],
  );
  const { type, setType, tags, setTags, version, setVersion, note, setNote, confirm } = useUploadForm(open, defaultType, onConfirm);
  const total = files.reduce((sum, file) => sum + file.size, 0);
  const actions = (
    <>
      <Button variant="tertiary" onClick={onCancel}>Cancel</Button>
      <Button variant="primary" onClick={confirm}>
        Upload {files.length === 1 ? '1 file' : `${files.length} files`}
      </Button>
    </>
  );

  return (
    <DialogShell open={open} onClose={onCancel} title="Upload" actions={actions} className="upload-dialog">
      <Stack gap="md" align="stretch">
        <Text as="ul" className="upload-dialog__files">
          {files.map((file) => (
            <Text as="li" key={`${file.name}:${file.size}`} className="upload-dialog__file">
              <Text as="span">{file.name}</Text>
              <Text as="span" variant="caption">{formatBytes(file.size)}</Text>
            </Text>
          ))}
        </Text>
        <Text as="p" variant="caption">{formatBytes(total)} in total, stored exactly as sent.</Text>
        <FileMetaFields
          variant="upload"
          type={type}
          typeOptions={typeOptions}
          tags={tags}
          knownTags={knownTags}
          version={version}
          note={note}
          onTypeChange={setType}
          onTagsChange={setTags}
          onVersionChange={setVersion}
          onNoteChange={setNote}
        />
      </Stack>
    </DialogShell>
  );
};

export { UploadDialog };
