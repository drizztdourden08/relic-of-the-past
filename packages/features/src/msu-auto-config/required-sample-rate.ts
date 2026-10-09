/* @layer shared-features @kind logic */
import type { GameSettings } from '../settings';
import { OPUS_SAMPLE_RATE, PCM_SAMPLE_RATE } from './msu-auto-config.constants';

const requiredSampleRate = (mode: GameSettings['enableMSU']): number | null => {
  if (mode === 'false' || mode === 'msul') return null;
  return mode === 'opuz' || mode === 'deluxe-opuz' ? OPUS_SAMPLE_RATE : PCM_SAMPLE_RATE;
};

export { requiredSampleRate };
