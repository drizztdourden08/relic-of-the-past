/* @layer renderer-components @kind component */
import { Box, EmptyState } from '@drizztdourden08/tessera/primitives';
import { SoundListItem } from './SoundListItem';
import type { SoundPanelRowsProps } from './SoundPanelRows.type';

const SoundPanelRows = (props: SoundPanelRowsProps) => {
  const { channel, sound, filter, onSelect, onPreview, onPlayOriginal } = props;

  if (sound.rows.length === 0) return <EmptyState message={`No sound on this channel matches "${filter}"`} />;

  return (
    <Box className="track-list">
      {sound.rows.map((row) => (
        <SoundListItem
          key={row.soundId}
          channel={channel}
          row={row}
          sound={sound}
          onSelect={onSelect}
          onPreview={onPreview}
          onPlayOriginal={onPlayOriginal}
        />
      ))}
    </Box>
  );
};

export { SoundPanelRows };
