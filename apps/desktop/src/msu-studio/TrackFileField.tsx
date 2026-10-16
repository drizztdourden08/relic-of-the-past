/* @layer renderer-components @kind component */
import { Field, Select } from '@drizztdourden08/tessera/primitives';
import { formatBytes } from '@drizztdourden08/brock-core';
import type { TrackFileFieldProps } from './TrackFileField.type';

const TrackFileField = (props: TrackFileFieldProps) => {
  const { trackNum, fileName, fileSize, options, busy, readOnly, onAssign } = props;

  return (
    <Field label="File" hint={fileSize == null ? undefined : formatBytes(fileSize)}>
      <Select
        value={fileName ?? ''}
        options={options}
        placeholder="Select file..."
        searchable
        disabled={busy || readOnly}
        onChange={(value) => onAssign(trackNum, value)}
      />
    </Field>
  );
};

export { TrackFileField };
