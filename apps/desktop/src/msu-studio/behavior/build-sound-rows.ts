/* @layer renderer-components @kind logic */
import type { Message } from '@drizztdourden08/brock-core/i18n';
import type { SoundChannel } from '@rotp/game-data';
import { soundsOfChannel, soundName, ambientRole, isAmbientReachable } from '@rotp/game-data';
import { SOUND_ID_COUNT } from '@rotp/hub-contracts';
import { soundHexId } from '../sound-labels';
import { FIRST_PLAYABLE_ID } from './sound-rows.constants';
import type { SoundRowData } from '../msu.type';

const reachOf = (channel: SoundChannel, soundId: number) => ({
  role: channel === 'ambient' ? ambientRole(soundId) : null,
  unreachable: channel === 'ambient' && !isAmbientReachable(soundId),
});

const buildSoundRows = (
  channel: SoundChannel,
  layerCountOf: (soundId: number) => number,
  text: (value: Message) => string,
): SoundRowData[] => {
  const textOrNull = (value: Message | null): string | null => (value === null ? null : text(value));
  const named = soundsOfChannel(channel).map((sound): SoundRowData => ({
    soundId: sound.id,
    hex: soundHexId(sound.id),
    label: textOrNull(sound.label),
    triggers: sound.triggers,
    sites: sound.sites,
    layerCount: layerCountOf(sound.id),
    unlisted: false,
    ...reachOf(channel, sound.id),
  }));
  const known = new Set(named.map((row) => row.soundId));
  const rest: SoundRowData[] = [];
  for (let id = FIRST_PLAYABLE_ID; id < SOUND_ID_COUNT; id++) {
    if (known.has(id)) continue;
    rest.push({
      soundId: id,
      hex: soundHexId(id),
      label: textOrNull(soundName(channel, id)),
      triggers: [],
      sites: 0,
      layerCount: layerCountOf(id),
      unlisted: true,
      ...reachOf(channel, id),
    });
  }
  return [...named, ...rest];
};

export { buildSoundRows };
