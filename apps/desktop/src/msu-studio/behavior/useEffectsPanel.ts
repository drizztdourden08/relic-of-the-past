/* @layer renderer-components @kind hook */
import { useCallback, useMemo, useState } from 'react';
import type { SoundChannel } from '@rotp/game-data';
import { EFFECT_CHANNELS, soundTitle } from '../sound-labels';
import type { MsuEffectsPanelProps } from '../msu.type';
import { parseEffectQuery } from './effect-query';
import type { EffectRow } from './effects-panel.type';
import { useSoundPanel } from './useSoundPanel';

const [FIRST, SECOND] = EFFECT_CHANNELS;

const useEffectsPanel = (props: MsuEffectsPanelProps) => {
  const { pack, manifest, saveBase, files, onDeleteConfirm, onReload } = props;
  const [filter, setFilter] = useState('');
  const query = parseEffectQuery(filter);
  const shared = {
    pack, manifest, saveBase, files, filter: query.text, showUnreachable: false, reload: onReload,
  };
  const first = useSoundPanel({ ...shared, channel: FIRST });
  const second = useSoundPanel({ ...shared, channel: SECOND });

  const panelOf = useCallback((channel: SoundChannel) => (channel === FIRST ? first : second), [first, second]);
  const otherOf = useCallback((channel: SoundChannel) => (channel === FIRST ? second : first), [first, second]);

  const wanted = query.channel;
  const rows = useMemo<EffectRow[]>(() => [
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

  return { filter, setFilter, first, second, panelOf, rows, play, playOriginal, toggleLayers, stopAll, confirmStopReplacing };
};

export { useEffectsPanel };
