/* @layer renderer-components @kind component */
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
import { EFFECTS_SUBTITLE } from './MsuEffectsPanel.constants';
import type { MsuEffectsPanelProps } from './msu.type';

const [FIRST, SECOND] = EFFECT_CHANNELS;

const MsuEffectsPanel = (props: MsuEffectsPanelProps) => {
  const { pack, manifest, saveBase, files, isLayered, readOnly, onDeleteConfirm, onReload } = props;
  const [filter, setFilter] = useState('');
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

  const wanted = query.channel;
  const rows = useMemo(() => [
    ...(wanted === SECOND ? [] : first.rows.map((row) => ({ channel: FIRST, row }))),
    ...(wanted === FIRST ? [] : second.rows.map((row) => ({ channel: SECOND, row }))),
  ].sort((a, b) => a.row.soundId - b.row.soundId || a.channel.localeCompare(b.channel)),
  [first.rows, second.rows, wanted]);

  const play = useCallback((channel: SoundChannel, soundId: number) => {
    otherOf(channel).stop();
    panelOf(channel).play(channel, soundId);
  }, [otherOf, panelOf]);

  const playOriginal = useCallback((channel: SoundChannel, soundId: number) => {
    otherOf(channel).stop();
    panelOf(channel).playOriginal(soundId);
  }, [otherOf, panelOf]);

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
        title={`Effects · ${replaced} of ${total} replaced`}
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
              readOnly={readOnly}
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
