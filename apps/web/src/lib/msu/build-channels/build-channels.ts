/* @layer renderer-lib @kind logic */
import type { SoundChannel } from '@shared/types/msu-manifest';
import { createSoundChannel } from '../channel';
import type { MsuChannelName, SoundChannelApi } from '../channel';
import type { BuildChannelsParams } from './build-channels.type';
import { SOUND_CACHE_LIMIT } from './build-channels.constants';
import { soundPrograms } from './sound-programs';

const buildChannels = (params: BuildChannelsParams): Record<MsuChannelName, SoundChannelApi> => {
  const { ctx, musicOut, ambientOut, sfxOut, manifest, loadBytes, resumeEnabled, onError, onTrack, onAmbient } = params;
  const shared = { ctx, loadBytes, onError };

  const effects = (name: SoundChannel): SoundChannelApi => createSoundChannel({
    ...shared,
    destination: sfxOut,
    name,
    kind: 'additive',
    programs: soundPrograms(manifest, name),
    cacheLimit: SOUND_CACHE_LIMIT,
  });

  return {
    music: createSoundChannel({
      ...shared,
      destination: musicOut,
      name: 'music',
      kind: 'stateful',
      programs: manifest.tracks.map((track) => ({ id: track.trackNum, layers: track.layers })),
      resumeEnabled,
      restartOnRepeat: true,
      onStart: onTrack,
    }),
    ambient: createSoundChannel({
      ...shared,
      destination: ambientOut,
      name: 'ambient',
      kind: 'stateful',
      programs: soundPrograms(manifest, 'ambient'),
      cacheLimit: SOUND_CACHE_LIMIT,
      resumeEnabled,
      onStart: onAmbient,
    }),
    sfx1: effects('sfx1'),
    sfx2: effects('sfx2'),
  };
};

export { buildChannels };
