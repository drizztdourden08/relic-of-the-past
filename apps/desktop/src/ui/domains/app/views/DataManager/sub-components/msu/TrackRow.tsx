/* @layer renderer-components @kind component */
import { useState } from 'react';
import { Select } from '../../../../../../design-system/primitives/Select';
import { formatBytes } from '../../../../../../../utils/formatBytes';
import type { TrackRowProps } from './types';

const TrackRow = (props: TrackRowProps) => {
  const { trackNum, description, fileName, fileSize, options, onAssign } = props;
  const [editing, setEditing] = useState(false);

  return (
    <div className="track-list__item">
      <span className="track-list__num">#{trackNum}</span>
      <span className="track-list__name">{description}</span>
      {editing ? (
        <div style={{ minWidth: 200, maxWidth: 280 }}>
          <Select
            value={fileName ?? ''}
            onChange={(val) => { onAssign(trackNum, val); setEditing(false); }}
            options={options}
            placeholder="Select file…"
            searchable
            size="sm"
          />
        </div>
      ) : (
        <>
          <span
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
          </span>
          {fileSize != null && (
            <span className="track-list__size">{formatBytes(fileSize)}</span>
          )}
        </>
      )}
    </div>
  );
};

export { TrackRow };
