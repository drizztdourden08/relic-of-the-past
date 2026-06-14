/* @layer renderer-components @kind component */
import { useState } from 'react';
import type { CSSProperties } from 'react';
import { Select } from '../../../../../../design-system/primitives/Select';
import { Box } from '../../../../../../design-system/primitives/Box';
import { Text } from '../../../../../../design-system/primitives/Text';
import { formatBytes } from '../../../../../../../utils/formatBytes';
import type { TrackRowProps } from './msu.type';

const SELECT_WRAP: CSSProperties = { minWidth: 200, maxWidth: 280 };

const TrackRow = (props: TrackRowProps) => {
  const { trackNum, description, fileName, fileSize, options, onAssign } = props;
  const [editing, setEditing] = useState(false);

  return (
    <Box className="track-list__item">
      <Text className="track-list__num">#{trackNum}</Text>
      <Text className="track-list__name">{description}</Text>
      {editing ? (
        <Box style={SELECT_WRAP}>
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
              color: fileName ? 'var(--c-text-dim)' : 'var(--c-text-faint)',
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
