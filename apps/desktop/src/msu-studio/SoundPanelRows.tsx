/* @layer renderer-components @kind component */
import { Box, EmptyState } from '@drizztdourden08/tessera/primitives';
import { SoundListItem } from './SoundListItem';
import type { SoundPanelRowsProps } from './SoundPanelRows.type';

const SoundPanelRows = (props: SoundPanelRowsProps) => {
  const { sound, filter, availableFiles, pack, channel, manifest, saveBase, isLayered, readOnly, onConfirm, onReload, onStopReplacing } = props;

  if (sound.rows.length === 0) return <EmptyState message={`No sound on this channel matches "${filter}"`} />;

  return (
    <Box className="track-list">
      {sound.rows.map((row) => (
        <SoundListItem
          key={row.soundId}
          pack={pack}
          channel={channel}
          row={row}
          sound={sound}
          manifest={manifest}
          saveBase={saveBase}
          availableFiles={availableFiles}
          isLayered={isLayered}
          readOnly={readOnly}
          onPreview={sound.play}
          onPlayOriginal={(_channel, soundId) => sound.playOriginal(soundId)}
          onToggleLayers={(_channel, soundId) => sound.toggleLayers(soundId)}
          onStopReplacing={onStopReplacing}
          onConfirm={onConfirm}
          onReload={onReload}
        />
      ))}
    </Box>
  );
};

export { SoundPanelRows };
