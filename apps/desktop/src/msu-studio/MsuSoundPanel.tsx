/* @layer renderer-components @kind component */
import { useState } from 'react';
import { Box } from '@drizztdourden08/tessera/primitives';
import { StudioLayout } from '@drizztdourden08/tessera/composites';
import { STUDIO_EDITOR_MIN_WIDTH, StudioPanelContent } from '@app/studio';
import { SoundListHeader } from './SoundListHeader';
import { SoundPanelRows } from './SoundPanelRows';
import { SoundSide } from './SoundSide';
import { soundToolGroups } from './sound-tool-groups';
import { soundPanelSubtitle } from './behavior/sound-subtitle';
import { useSoundPanel } from './behavior/useSoundPanel';
import { useSoundTabActions } from './behavior/useSoundTabActions';
import { SOUND_FILTER_HINT } from './msu.constants';
import { SOUND_CHANNEL_LABELS } from './sound-labels';
import { DETAILS_PANEL, EDITOR_LABELS } from './studio-frame/studio-frame.constants';
import type { MsuSoundPanelProps } from './MsuSoundPanel.type';

const MsuSoundPanel = (props: MsuSoundPanelProps) => {
  const { pack, channel, manifest, saveBase, files, isLayered, readOnly, tabs, packPanel, onDeleteConfirm, onReload } = props;
  const [filter, setFilter] = useState('');
  const [showUnreachable, setShowUnreachable] = useState(false);
  const sound = useSoundPanel({ pack, channel, manifest, saveBase, files, filter, showUnreachable, reload: onReload });
  const { confirmStopReplacing, select, original } = useSoundTabActions({ sound, onDeleteConfirm });

  const openRow = sound.rows.find((row) => row.soundId === sound.openSound);
  const detail = (
    <SoundSide
      open={openRow === undefined ? null : { channel, row: openRow, sound }}
      noteTitle={SOUND_CHANNEL_LABELS[channel]}
      note={`${soundPanelSubtitle({ ...sound, channel, showUnreachable })} ${SOUND_FILTER_HINT}`}
      packPanel={packPanel}
      pack={pack}
      manifest={manifest}
      saveBase={saveBase}
      files={files}
      isLayered={isLayered}
      readOnly={readOnly}
      onPreview={sound.play}
      onPlayOriginal={original}
      onStopReplacing={confirmStopReplacing}
      onClose={sound.closeLayers}
      onConfirm={onDeleteConfirm}
      onReload={onReload}
    />
  );

  const toolbar = soundToolGroups({
    tabs,
    unreachableCount: sound.unreachableCount,
    filter,
    showUnreachable,
    onFilterChange: setFilter,
    onShowUnreachableChange: setShowUnreachable,
  });

  return (
    <StudioLayout
      editorLabel={EDITOR_LABELS.ambient}
      compactToolbar
      editorMinWidth={STUDIO_EDITOR_MIN_WIDTH}
      toolbar={toolbar}
      end={{ ...DETAILS_PANEL, content: <StudioPanelContent>{detail}</StudioPanelContent> }}
    >
      <Box className="msu-panel">
        <SoundListHeader
          title={`${SOUND_CHANNEL_LABELS[channel]} · ${sound.replacedCount} of ${sound.total} replaced`}
          sounding={sound.playing !== null || sound.playingOriginal !== null}
          status={sound.statusMessage}
          statusOk={sound.statusOk}
          onStop={sound.stop}
        />
        <SoundPanelRows channel={channel} sound={sound} filter={filter} onSelect={select} onPreview={sound.play} onPlayOriginal={original} />
      </Box>
    </StudioLayout>
  );
};

export { MsuSoundPanel };
