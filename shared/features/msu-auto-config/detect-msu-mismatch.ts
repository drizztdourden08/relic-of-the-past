/* @layer shared-features @kind logic */
import type { GameSettings } from '@shared/types/settings';
import { requiredSampleRate } from './required-sample-rate';

const detectMsuMismatch = (settings: GameSettings): string | null => {
  if (settings.msuConfigMode === 'auto' || settings.vanillaSafe) return null;
  const required = requiredSampleRate(settings.enableMSU);
  if (required === null || settings.audioFreq === required) return null;
  return `${settings.enableMSU} packs are ${required} Hz, but the output is set to ${settings.audioFreq} Hz, which plays them at the wrong speed.`;
};

export { detectMsuMismatch };
