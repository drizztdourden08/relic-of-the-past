/* @layer renderer-components @kind component */
/**
 * Both effect channels as ONE list.
 *
 * They are the same kind of thing — one-shot effects, each trigger layering over whatever is still
 * sounding — and asking someone to guess which of two lists holds the bonk they are after was the
 * whole problem with keeping them apart. So there is one search box, and it searches everything.
 *
 * The channels are still separate id spaces: 0x12 on the first port and 0x12 on the second are
 * different sounds. That is carried by the row itself — every row leads with its port — rather
 * than by splitting the list, so the ids can sit next to each other and be compared. Sorting by id
 * first and port second is what puts them next to each other.
 *
 * Each channel keeps its own controller because each is its own id space with its own audition and
 * its own writes. This component's job is to hand them one query, pick the right one per row, and
 * keep them from both making a sound at once.
 */
import { useCallback, useMemo, useState } from 'react';
import type { SoundChannel } from '@shared/types/msu-manifest';
import { Box } from '@ds/primitives/Box';
import { Button } from '@ds/primitives/Button';
import { EmptyState } from '@ds/primitives/EmptyState';
import { Field } from '@ds/primitives/Field';
import { SectionHeader } from '@ds/primitives/SectionHeader';
import { Text } from '@ds/primitives/Text';
import { TextInput } from '@ds/primitives/TextInput';
import { SoundListItem } from './SoundListItem';
import { parseEffectQuery } from './behavior/effect-query';
import { useSoundPanel } from './behavior/useSoundPanel';
import { EFFECT_CHANNELS, soundTitle } from './sound-labels';
import { SOUND_FILTER_HINT, SOUND_FILTER_PLACEHOLDER } from './msu.constants';
import { soundPreviewKey } from './behavior/preview-key';
import type { MsuEffectsPanelProps } from './msu.type';

const [FIRST, SECOND] = EFFECT_CHANNELS;

const EFFECTS_SUBTITLE = 'The sound chip raises one-shot effects on two ports, each numbering its'
  + ' sounds from scratch — so the same id is a different sound on each. Every row leads with the'
  + ' port it belongs to.';

const MsuEffectsPanel = (props: MsuEffectsPanelProps) => {
  const { pack, manifest, saveBase, files, isLayered, onDeleteConfirm, onReload } = props;
  const [filter, setFilter] = useState('');
  // `sfx2` in the box means the port, not text to find — so it is taken out before the channels
  // are asked, and applied to the merged list instead.
  const query = parseEffectQuery(filter);
  const shared = {
    pack, manifest, saveBase, files, filter: query.text, showUnreachable: false, reload: onReload,
  };
  const first = useSoundPanel({ ...shared, channel: FIRST });
  const second = useSoundPanel({ ...shared, channel: SECOND });
  const availableFiles = files.map((file) => file.name);

  const panelOf = useCallback(
    (channel: SoundChannel) => (channel === FIRST ? first : second),
    [first, second],
  );
  const otherOf = useCallback(
    (channel: SoundChannel) => (channel === FIRST ? second : first),
    [first, second],
  );

  // One list, so the ids interleave: 0x01 on both ports, then 0x02 on both. Grouping by port
  // instead would put the two lists back, only without the headings that made them navigable.
  const wanted = query.channel;
  const rows = useMemo(() => [
    ...(wanted === SECOND ? [] : first.rows.map((row) => ({ channel: FIRST, row }))),
    ...(wanted === FIRST ? [] : second.rows.map((row) => ({ channel: SECOND, row }))),
  ].sort((a, b) => a.row.soundId - b.row.soundId || a.channel.localeCompare(b.channel)),
  [first.rows, second.rows, wanted]);

  // Each channel silences its own audition but knows nothing of the other's, so the list has to
  // stop the other one itself — otherwise two sounds run at once and both rows light up.
  const play = useCallback((channel: SoundChannel, soundId: number) => {
    otherOf(channel).stop();
    panelOf(channel).play(channel, soundId);
  }, [otherOf, panelOf]);

  const playOriginal = useCallback((channel: SoundChannel, soundId: number) => {
    otherOf(channel).stop();
    panelOf(channel).playOriginal(soundId);
  }, [otherOf, panelOf]);

  // Same reasoning for the editor: one row open at a time across the whole list, or two editors
  // sit open over one shared save.
  const toggleLayers = useCallback((channel: SoundChannel, soundId: number) => {
    otherOf(channel).closeLayers();
    panelOf(channel).toggleLayers(soundId);
  }, [otherOf, panelOf]);

  const stopAll = useCallback(() => { first.stop(); second.stop(); }, [first, second]);

  const confirmStopReplacing = useCallback((channel: SoundChannel, soundId: number) => {
    onDeleteConfirm(
      'Stop Replacing Sound',
      `Remove this pack's layers for ${soundTitle(channel, soundId)}? It will play from the sound chip again.`,
      () => { void panelOf(channel).stopReplacing(soundId); },
    );
  }, [onDeleteConfirm, panelOf]);

  const replaced = first.replacedCount + second.replacedCount;
  const total = first.total + second.total;
  const sounding = first.playing !== null || second.playing !== null
    || first.playingOriginal !== null || second.playingOriginal !== null;
  const status = first.statusMessage ?? second.statusMessage;
  const statusOk = first.statusOk && second.statusOk;

  return (
    <Box className="msu-panel">
      <SectionHeader
        title={`Effects — ${replaced} of ${total} replaced`}
        subtitle={EFFECTS_SUBTITLE}
        action={sounding ? <Button variant="tertiary" size="sm" onClick={stopAll}>Stop preview</Button> : null}
      />

      <Field label="Find a sound" hint={`${SOUND_FILTER_HINT} Add SFX1 or SFX2 to narrow to one port.`}>
        <TextInput
          type="text"
          placeholder={SOUND_FILTER_PLACEHOLDER}
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
        />
      </Field>

      {status != null && (
        <Text className={`msu-status${statusOk ? '' : ' msu-status--error'}`}>{status}</Text>
      )}

      {rows.length === 0 ? (
        <EmptyState message={`No effect on either port matches "${filter}"`} />
      ) : (
        <Box className="track-list">
          {rows.map(({ channel, row }) => (
            <SoundListItem
              // Keyed by channel AND id: the ports share id numbers, so the id alone repeats.
              key={soundPreviewKey(channel, row.soundId)}
              pack={pack}
              channel={channel}
              row={row}
              sound={panelOf(channel)}
              manifest={manifest}
              saveBase={saveBase}
              availableFiles={availableFiles}
              isLayered={isLayered}
              showChannel
              onPreview={play}
              onPlayOriginal={playOriginal}
              onToggleLayers={toggleLayers}
              onStopReplacing={(soundId) => confirmStopReplacing(channel, soundId)}
              onConfirm={onDeleteConfirm}
              onReload={onReload}
            />
          ))}
        </Box>
      )}
    </Box>
  );
};

export { MsuEffectsPanel };
