/* @layer renderer-components @kind component */
import { useState } from 'react';
import { Badge } from '@ds/primitives/Badge';
import { Box } from '@ds/primitives/Box';
import { IconButton } from '@ds/primitives/IconButton';
import { Select } from '@ds/primitives/Select';
import { Text } from '@ds/primitives/Text';
import { formatBytes } from '@app/utils/formatBytes';
import type { TrackRowProps } from './msu.type';

const TrackRow = (props: TrackRowProps) => {
  const {
    trackNum, description, fileName, fileSize, layerCount, options,
    playing, busy, expanded, playingOriginal,
    onAssign, onPreview, onStopPreview, onPlayOriginal, onToggleLayers,
  } = props;
  const [editing, setEditing] = useState(false);
  const hasAudio = fileName !== null;

  return (
    <Box className={`track-list__item msu-track-row${expanded ? ' msu-track-row--open' : ''}`}>
      <Text className="track-list__num">#{trackNum}</Text>
      <Text className="track-list__name">{description}</Text>

      {editing ? (
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
      ) : (
        <>
          <Text
            className={`msu-track-row__file${hasAudio ? '' : ' msu-track-row__file--empty'}`}
            title={fileName ?? 'Click to assign a file'}
            onClick={() => setEditing(true)}
          >
            {fileName ?? '-'}
          </Text>
          {fileSize != null && <Text className="track-list__size">{formatBytes(fileSize)}</Text>}
        </>
      )}

      {layerCount > 1 && <Badge variant="success">{layerCount} layers</Badge>}

      <Box className="msu-track-row__actions">
        {hasAudio && (
          <IconButton
            variant="ghost"
            size="sm"
            label={playing ? `Stop slot ${trackNum}` : `Preview slot ${trackNum}`}
            active={playing}
            onClick={() => (playing ? onStopPreview() : onPreview(trackNum))}
          >
            {playing ? '■' : '▶'}
          </IconButton>
        )}
        <IconButton
          variant="ghost"
          size="sm"
          label={playingOriginal
            ? `Stop slot ${trackNum}`
            : `Play the sound chip's own slot ${trackNum}${hasAudio ? ', to compare' : ''}`}
          active={playingOriginal}
          onClick={() => onPlayOriginal(trackNum)}
        >
          {playingOriginal ? '■' : '▷'}
        </IconButton>
        <IconButton
          variant="ghost"
          size="sm"
          label={`Layers and audio for slot ${trackNum}`}
          active={expanded}
          disabled={busy}
          onClick={() => onToggleLayers(trackNum)}
        >
          ☰
        </IconButton>
      </Box>
    </Box>
  );
};

export { TrackRow };
