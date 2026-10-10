/* @layer renderer-lib @kind logic */
import {
  FRAME_COUNT_MASK, HYBRID_CONFIGS, HYBRID_FRAME_SAMPLES, MUSIC_FRAME_SAMPLES, SPEECH_CONFIGS, SPEECH_FRAME_SAMPLES,
} from './opus-packets.constants';

const samplesAt = (table: readonly number[], index: number): number => {
  const samples = table[index];
  if (samples === undefined) throw new Error(`No Opus frame size at index ${String(index)}`);
  return samples;
};

const frameSamples = (config: number): number => {
  if (config < SPEECH_CONFIGS) return samplesAt(SPEECH_FRAME_SAMPLES, config & 3);
  if (config < HYBRID_CONFIGS) return samplesAt(HYBRID_FRAME_SAMPLES, config & 1);
  return samplesAt(MUSIC_FRAME_SAMPLES, config & 3);
};

const frameCount = (data: Uint8Array): number => {
  const code = (data[0] ?? 0) & 3;
  if (code === 0) return 1;
  if (code < 3) return 2;
  return data.length > 1 ? (data[1] ?? 0) & FRAME_COUNT_MASK : 0;
};

const opusPacketSamples = (data: Uint8Array): number =>
  data.length === 0 ? 0 : frameSamples((data[0] ?? 0) >> 3) * frameCount(data);

export { opusPacketSamples };
export type { OpusPacket } from './opus-packets.type';
