/* @layer shared-features @kind logic */
import type { GameSettings } from '../settings';
import { DEFAULT_BUFFER, OPUS_SAMPLE_RATE, PCM_SAMPLE_RATE } from './msu-auto-config.constants';
import type { MsuPackProfile, ResolvedAudioConfig } from './msu-auto-config.type';
import { modeForPack } from './mode-for-pack';

const resolveAudioConfig = (settings: GameSettings, pack: MsuPackProfile | null): ResolvedAudioConfig => {
  const asIs: ResolvedAudioConfig = {
    enableMSU: settings.enableMSU,
    audioFreq: settings.audioFreq,
    audioChannels: settings.audioChannels,
    audioSamples: settings.audioSamples,
  };
  if (settings.msuConfigMode === 'manual') return asIs;
  if (settings.vanillaSafe || !pack) return { ...asIs, enableMSU: 'false' };

  return {
    enableMSU: modeForPack(pack),
    audioFreq: pack.hasOpuz ? OPUS_SAMPLE_RATE : PCM_SAMPLE_RATE,
    audioChannels: 2,
    audioSamples: DEFAULT_BUFFER,
  };
};

export { resolveAudioConfig };
