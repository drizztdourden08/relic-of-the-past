/* @layer renderer-components @kind component */
import { useState } from 'react';
import { Select } from '../../../../../../design-system/primitives/Select';
import { Box } from '../../../../../../design-system/primitives/Box';
import { Text } from '../../../../../../design-system/primitives/Text';
import { formatBytes } from '../../../../../../../utils/formatBytes';
import type { TrackRowProps } from './msu.type';

const TrackRow = (props: TrackRowProps) => {
  const { trackNum, description, fileName, fileSize, options, onAssign } = props;
  const [editing, setEditing] = useState(false);

  return (
    <Box className="track-list__item">
      <Text className="track-list__num">#{trackNum}</Text>
      <Text className="track-list__name">{description}</Text>
      {editing ? (
        <Box style={{ minWidth: 200, maxWidth: 280 }}>
          <Select
            value={fileName ?? ''}
            onChange={(val) => { onAssign(trackNum, val); setEditing(false); }}
            options={options}
            placeholder="Select file…"
            searchable
            size="sm"
          />
        </Box>
      ) : (
        <>
          <Text
            className="track-list__file"
            style={{
              color: fileName ? 'var(--color-text-secondary)' : 'var(--color-text-faint)',
              cursor: 'pointer',
              fontSize: 'var(--text-xs)',
              flex: '0 0 auto',
              maxWidth: 180,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
            title={fileName ?? 'Click to assign'}
            onClick={() => setEditing(true)}
          >
            {fileName ? fileName : '—'}
          </Text>
          {fileSize != null && (
            <Text className="track-list__size">{formatBytes(fileSize)}</Text>
          )}
        </>
      )}
    </Box>
  );
};

export { TrackRow };
