/* @layer renderer-components @kind component */
import { useCallback, useState } from 'react';
import { Box, Button, SectionHeader } from '@drizztdourden08/tessera/primitives';
import { SoundPanelControls } from './SoundPanelControls';
import { SoundPanelRows } from './SoundPanelRows';
import { soundPanelSubtitle } from './behavior/sound-subtitle';
import { useSoundPanel } from './behavior/useSoundPanel';
import { SOUND_CHANNEL_LABELS, soundTitle } from './sound-labels';
import type { MsuSoundPanelProps } from './MsuSoundPanel.type';

const MsuSoundPanel = (props: MsuSoundPanelProps) => {
  const { pack, channel, manifest, saveBase, files, isLayered, readOnly, onDeleteConfirm, onReload } = props;
  const [filter, setFilter] = useState('');
  const [showUnreachable, setShowUnreachable] = useState(false);
  const sound = useSoundPanel({
    pack, channel, manifest, saveBase, files, filter, showUnreachable, reload: onReload,
  });
  const { replacedCount, total, playing } = sound;

  const { stopReplacing } = sound;
  const confirmStopReplacing = useCallback((soundId: number) => {
    onDeleteConfirm(
      'Stop Replacing Sound',
      `Remove this pack's layers for ${soundTitle(channel, soundId)}? It will play from the sound chip again.`,
      () => { void stopReplacing(soundId); },
    );
  }, [channel, onDeleteConfirm, stopReplacing]);

  return (
    <Box className="msu-panel">
      <SectionHeader
        title={`${SOUND_CHANNEL_LABELS[channel]} · ${replacedCount} of ${total} replaced`}
        subtitle={soundPanelSubtitle({
          channel,
          total,
          raisedCount: sound.raisedCount,
          reachableCount: sound.reachableCount,
          hiddenCount: sound.hiddenCount,
          showUnreachable,
        })}
        action={playing !== null || sound.playingOriginal !== null
          ? <Button variant="tertiary" size="sm" onClick={sound.stop}>Stop preview</Button>
          : null}
      />

      <SoundPanelControls
        sound={sound}
        filter={filter}
        showUnreachable={showUnreachable}
        onFilterChange={setFilter}
        onShowUnreachableChange={setShowUnreachable}
      />

      <SoundPanelRows
        sound={sound}
        filter={filter}
        availableFiles={files.map((file) => file.name)}
        pack={pack}
        channel={channel}
        manifest={manifest}
        saveBase={saveBase}
        isLayered={isLayered}
        readOnly={readOnly}
        onConfirm={onDeleteConfirm}
        onReload={onReload}
        onStopReplacing={confirmStopReplacing}
      />
    </Box>
  );
};

export { MsuSoundPanel };
