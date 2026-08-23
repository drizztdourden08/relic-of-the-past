/* @layer renderer-components @kind component */
/**
 * One sound channel on its own tab: every id the channel can raise, which of them this pack
 * answers, and the editor for the ones it does.
 *
 * The filter earns its place here rather than on the music tab — a sound channel lists fifty or so
 * ids, and the way anyone arrives at one of them is by remembering the game function that raises
 * it. It is owned here, not in the hook, because a list built from more than one channel has to
 * put one query across all of them.
 */
import { useCallback, useState } from 'react';
import type { MsuPackManifest, SoundChannel } from '@shared/types/msu-manifest';
import { Box } from '@ds/primitives/Box';
import { Button } from '@ds/primitives/Button';
import { EmptyState } from '@ds/primitives/EmptyState';
import { Field } from '@ds/primitives/Field';
import { SectionHeader } from '@ds/primitives/SectionHeader';
import { Text } from '@ds/primitives/Text';
import { TextInput } from '@ds/primitives/TextInput';
import { Toggle } from '@ds/primitives/Toggle';
import { SoundListItem } from './SoundListItem';
import { soundPanelSubtitle } from './behavior/sound-subtitle';
import { useSoundPanel } from './behavior/useSoundPanel';
import { SOUND_CHANNEL_LABELS, soundTitle } from './sound-labels';
import { SOUND_FILTER_HINT, SOUND_FILTER_PLACEHOLDER, UNREACHABLE_DESCRIPTION } from './msu.constants';
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

const MsuSoundPanel = (props: MsuSoundPanelProps) => {
  const { pack, channel, manifest, saveBase, files, isLayered, onDeleteConfirm, onReload } = props;
  const [filter, setFilter] = useState('');
  // Off by default: the ids it reveals are ones nothing in the game can raise.
  const [showUnreachable, setShowUnreachable] = useState(false);
  const sound = useSoundPanel({
    pack, channel, manifest, saveBase, files, filter, showUnreachable, reload: onReload,
  });
  const { rows, replacedCount, total, playing } = sound;
  // Non-zero only where a reachable set exists to hide anything, which is the ambient channel.
  const hasHidden = sound.unreachableCount > 0;
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

      <Field label="Find a sound" hint={SOUND_FILTER_HINT}>
        <TextInput
          type="text"
          placeholder={SOUND_FILTER_PLACEHOLDER}
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
        />
      </Field>

      {hasHidden && (
        <Toggle
          checked={showUnreachable}
          onChange={setShowUnreachable}
          label="Show unreachable ids"
          description={UNREACHABLE_DESCRIPTION(sound.unreachableCount)}
        />
      )}

      {sound.statusMessage != null && (
        <Text className={`msu-status${sound.statusOk ? '' : ' msu-status--error'}`}>
          {sound.statusMessage}
        </Text>
      )}

      {rows.length === 0 ? (
        <EmptyState message={`No sound on this channel matches "${filter}"`} />
      ) : (
        <Box className="track-list">
          {rows.map((row) => (
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
              onPreview={sound.play}
              onPlayOriginal={(_channel, soundId) => sound.playOriginal(soundId)}
              onToggleLayers={(_channel, soundId) => sound.toggleLayers(soundId)}
              onStopReplacing={confirmStopReplacing}
              onConfirm={onDeleteConfirm}
              onReload={onReload}
            />
          ))}
        </Box>
      )}
    </Box>
  );
};

export { MsuSoundPanel };
export type { MsuSoundPanelProps };
