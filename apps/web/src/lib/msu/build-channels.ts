/* @layer renderer-lib @kind logic */
/**
 * Turns a pack manifest into the four channels the engine drives.
 *
 * Music comes from `tracks`, the other three from `sounds` — and a pack that authors no sounds
 * simply gets three empty channels, which is what every pack written before sound replacement
 * existed expects.
 */
import type { MsuPackManifest, SoundChannel } from '@shared/types/msu-manifest';
import { createSoundChannel } from './channel';
import type { MsuChannelName, SoundChannelApi, SoundProgram } from './channel';
import type { LoadBytes } from './track-loader';

/**
 * How many decoded programs each channel keeps. Music tracks are minutes of PCM, so a handful
 * covers area churn; effects are fractions of a second, and a channel may cycle through dozens
 * of them in a fight, so it is worth keeping far more decoded than re-decoding a bonk per hit.
 */
const SOUND_CACHE_LIMIT = 48;

const soundPrograms = (manifest: MsuPackManifest, channel: SoundChannel): SoundProgram[] =>
  (manifest.sounds?.[channel] ?? []).map((sound) => ({
    id: sound.soundId, layers: sound.layers, group: sound.syncGroup,
  }));

interface BuildChannelsParams {
  ctx: BaseAudioContext;
  /** Music and the ambient bed follow the music volume; the effect channels follow SFX. */
  musicOut: AudioNode;
  /** The bed's own group, so a storm can sit under quiet music without touching it. */
  ambientOut: AudioNode;
  sfxOut: AudioNode;
  manifest: MsuPackManifest;
  loadBytes: LoadBytes;
  resumeEnabled?: () => boolean;
  onError?: (message: string) => void;
  onTrack?: (trackNum: number, layerCount: number, resumed: boolean) => void;
  onAmbient?: (soundId: number, layerCount: number, resumed: boolean) => void;
}

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
    // No per-trigger callback: effects fire many times a second, so logging each one would
    // bury every other diagnostic. The channel's report() is how the studio watches them.
  });

  return {
    music: createSoundChannel({
      ...shared,
      destination: musicOut,
      name: 'music',
      kind: 'stateful',
      programs: manifest.tracks.map((track) => ({ id: track.trackNum, layers: track.layers })),
      resumeEnabled,
      // The game's own repeats are filtered before they reach us; the one that arrives follows a
      // fade to zero and is meant to bring the music back.
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

export { buildChannels, soundPrograms, SOUND_CACHE_LIMIT };
export type { BuildChannelsParams };
