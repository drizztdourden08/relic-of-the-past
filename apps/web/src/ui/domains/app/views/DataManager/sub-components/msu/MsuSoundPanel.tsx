/* @layer renderer-components @kind component */
/**
 * One sound channel's tab: every id the channel can raise, which of them this pack answers, and
 * the editor for the ones it does.
 *
 * The filter earns its place here rather than on the music tab — an effects channel lists fifty
 * or so ids, and the way anyone arrives at one of them is by remembering the game function that
 * raises it.
 */
import { useCallback } from 'react';
import type { MsuPackManifest, SoundChannel } from '@shared/types/msu-manifest';
import { Box } from '@ds/primitives/Box';
import { Button } from '@ds/primitives/Button';
import { EmptyState } from '@ds/primitives/EmptyState';
import { Field } from '@ds/primitives/Field';
import { SectionHeader } from '@ds/primitives/SectionHeader';
import { Text } from '@ds/primitives/Text';
import { TextInput } from '@ds/primitives/TextInput';
import { PreviewReadout } from './PreviewReadout';
import { SoundDetail } from './SoundDetail';
import { SoundRow } from './SoundRow';
import { soundTarget } from './behavior/layer-target';
import { soundPreviewKey } from './behavior/preview-key';
import { isAdditiveChannel } from './behavior/sound-channel-kind';
import { useSoundPanel } from './behavior/useSoundPanel';
import { SOUND_CHANNEL_LABELS, soundTitle } from './sound-labels';
import type { MsuFile } from './msu.type';

interface MsuSoundPanelProps {
  pack: string;
  channel: SoundChannel;
  /** What the rows and the editor SHOW. */
  manifest: MsuPackManifest;
  /** What a save WRITES into — see LayerEditorProps.saveBase. */
  saveBase: MsuPackManifest;
  files: MsuFile[];
  isLayered: boolean;
  onDeleteConfirm: (title: string, message: string, onConfirm: () => void) => void;
  onReload: () => void;
}

const CHANNEL_BLURB: Record<SoundChannel, string> = {
  ambient: 'The looping beds. A new one replaces the last, and its position is remembered across a save.',
  sfx1: 'One-shot effects. Each trigger layers over whatever is still sounding.',
  sfx2: 'One-shot effects. Each trigger layers over whatever is still sounding.',
};

const MsuSoundPanel = (props: MsuSoundPanelProps) => {
  const {
    pack, channel, manifest, saveBase, files, isLayered, onDeleteConfirm, onReload,
  } = props;
  const sound = useSoundPanel({ pack, channel, manifest, saveBase, files, reload: onReload });
  const { rows, replacedCount, raisedCount, total, playing, openSound } = sound;
  const additive = isAdditiveChannel(channel);
  const availableFiles = files.map((file) => file.name);

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
        title={`${SOUND_CHANNEL_LABELS[channel]} — ${replacedCount} of ${total} replaced`}
        subtitle={`${CHANNEL_BLURB[channel]} ${raisedCount} of the ${total} ids are ones the game asks for; the rest the channel can still carry.`}
        action={playing !== null || sound.playingOriginal !== null
          ? <Button variant="tertiary" size="sm" onClick={sound.stop}>Stop preview</Button>
          : null}
      />

      <Field label="Find a sound" hint="Matches the id, its name, or the game function that raises it.">
        <TextInput
          type="text"
          placeholder="0x0C, explosion, AncillaAdd_Bomb…"
          value={sound.filter}
          onChange={(e) => sound.setFilter(e.target.value)}
        />
      </Field>

      {sound.statusMessage != null && (
        <Text className={`msu-status${sound.statusOk ? '' : ' msu-status--error'}`}>
          {sound.statusMessage}
        </Text>
      )}

      {rows.length === 0 ? (
        <EmptyState message={`No sound on this channel matches "${sound.filter}"`} />
      ) : (
        <Box className="track-list">
          {rows.map((row) => (
            <Box key={row.soundId}>
              <SoundRow
                row={row}
                channel={channel}
                playing={playing === soundPreviewKey(channel, row.soundId)}
                additive={additive}
                busy={sound.uploading}
                expanded={openSound === row.soundId}
                playingOriginal={sound.playingOriginal === row.soundId}
                chipAudible={sound.chipAudible(row.soundId)}
                onPreview={sound.play}
                onStopPreview={sound.stop}
                onPlayOriginal={sound.playOriginal}
                onToggleLayers={sound.toggleLayers}
                onStopReplacing={confirmStopReplacing}
              />
              {playing === soundPreviewKey(channel, row.soundId) && (
                <PreviewReadout
                  store={sound.reportStore}
                  previewKey={soundPreviewKey(channel, row.soundId)}
                  label={soundTitle(channel, row.soundId)}
                />
              )}
              {openSound === row.soundId && (
                <SoundDetail
                  pack={pack}
                  target={soundTarget(channel, row.soundId)}
                  manifest={manifest}
                  saveBase={saveBase}
                  availableFiles={availableFiles}
                  isLayered={isLayered}
                  reportStore={sound.reportStore}
                  unclaimed={row.layerCount === 0}
                  uploading={sound.uploading}
                  onUpload={sound.handleUpload}
                  onSaved={onReload}
                />
              )}
            </Box>
          ))}
        </Box>
      )}
    </Box>
  );
};

export { MsuSoundPanel };
export type { MsuSoundPanelProps };
