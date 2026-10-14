/* @layer renderer-components @kind component */
import { useState } from 'react';
import { Box, Select, Text } from '@drizztdourden08/tessera/primitives';
import { formatBytes } from '@drizztdourden08/brock-core';
import type { TrackFileCellProps } from './TrackFileCell.type';

const TrackFileCell = (props: TrackFileCellProps) => {
  const { trackNum, fileName, fileSize, options, readOnly, onAssign } = props;
  const [editing, setEditing] = useState(false);

  if (editing) {
    return (
      <Box className="msu-track-row__select">
        <Select
          value={fileName ?? ''}
          onChange={(value) => { onAssign(trackNum, value); setEditing(false); }}
          options={options}
          placeholder="Select file..."
          searchable
          size="sm"
        />
      </Box>
    );
  }

  return (
    <>
      <Text
        className={`msu-track-row__file${fileName !== null ? '' : ' msu-track-row__file--empty'}`}
        title={readOnly ? fileName ?? undefined : fileName ?? 'Click to assign a file'}
        onClick={readOnly ? undefined : () => setEditing(true)}
      >
        {fileName ?? '-'}
      </Text>
      {fileSize != null && <Text className="track-list__size">{formatBytes(fileSize)}</Text>}
    </>
  );
};

export { TrackFileCell };
