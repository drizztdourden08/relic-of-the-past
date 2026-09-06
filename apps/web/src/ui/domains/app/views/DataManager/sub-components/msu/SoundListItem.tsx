/* @layer renderer-components @kind component */
/**
 * Shared by the ambient list and the merged effects list so the row, readout and editor stay
 * together. The channel's controller arrives whole; a merged list picks one per row.
 */
import { Box } from '@ds/primitives/Box';
import { PreviewReadout } from './PreviewReadout';
import { SoundDetail } from './SoundDetail';
import { SoundRow } from './SoundRow';
import { soundTarget } from './behavior/layer-target';
import { syncGroupOf } from './behavior/sound-manifest';
import { soundPreviewKey } from './behavior/preview-key';
import { isAdditiveChannel } from './behavior/sound-channel-kind';
import { soundTitle } from './sound-labels';
import type { SoundListItemProps } from './msu.type';

const SoundListItem = (props: SoundListItemProps) => {
  const {
    pack, channel, row, sound, manifest, saveBase, availableFiles, isLayered, showChannel = false,
    onPreview, onPlayOriginal, onToggleLayers, onStopReplacing, onConfirm, onReload,
  } = props;
  const previewKey = soundPreviewKey(channel, row.soundId);
  const playing = sound.playing === previewKey;
  const expanded = sound.openSound === row.soundId;

  return (
    <Box>
      <SoundRow
        row={row}
        channel={channel}
        showChannel={showChannel}
        playing={playing}
        additive={isAdditiveChannel(channel)}
        busy={sound.uploading}
        expanded={expanded}
        playingOriginal={sound.playingOriginal === row.soundId}
        chipAudible={sound.chipAudible(row.soundId)}
        onPreview={onPreview}
        onStopPreview={sound.stop}
        onPlayOriginal={(soundId) => onPlayOriginal(channel, soundId)}
        onToggleLayers={(soundId) => onToggleLayers(channel, soundId)}
        onStopReplacing={onStopReplacing}
      />

      {playing && (
        <PreviewReadout
          store={sound.reportStore}
          previewKey={previewKey}
          label={soundTitle(channel, row.soundId)}
        />
      )}

      {expanded && (
        <SoundDetail
          pack={pack}
          channel={channel}
          soundId={row.soundId}
          syncGroup={syncGroupOf(manifest, channel, row.soundId)}
          target={soundTarget(channel, row.soundId)}
          manifest={manifest}
          saveBase={saveBase}
          availableFiles={availableFiles}
          isLayered={isLayered}
          reportStore={sound.reportStore}
          onConfirm={onConfirm}
          unclaimed={row.layerCount === 0}
          uploading={sound.uploading}
          onUpload={sound.handleUpload}
          onSaved={onReload}
        />
      )}
    </Box>
  );
};

export { SoundListItem };
