/* @layer renderer-lib @kind logic */
/**
 * How much audio a single Opus packet holds, read from its own first byte.
 *
 * That byte (the "TOC") carries the coding mode and bandwidth in its top five bits and the
 * number of frames in the packet in its bottom two; the multi-frame code puts the frame count
 * in the byte after it. Everything downstream counts in 48 kHz samples — the rate Opus always
 * reports at and the unit Ogg granule positions use — so the tables here are in samples
 * rather than milliseconds.
 */

/** 10 / 20 / 40 / 60 ms — the four frame sizes the speech modes offer. */
const SPEECH_FRAME_SAMPLES = [480, 960, 1920, 2880];
/** 10 / 20 ms — the mixed speech-plus-music modes. */
const HYBRID_FRAME_SAMPLES = [480, 960];
/** 2.5 / 5 / 10 / 20 ms — the music-only modes, which is what a music pack uses. */
const MUSIC_FRAME_SAMPLES = [120, 240, 480, 960];

const SPEECH_CONFIGS = 12;
const HYBRID_CONFIGS = 16;
const FRAME_COUNT_MASK = 0x3f;

interface OpusPacket {
  data: Uint8Array;
  /** Decoded length in samples per channel at 48 kHz. */
  samples: number;
}

const frameSamples = (config: number): number => {
  if (config < SPEECH_CONFIGS) return SPEECH_FRAME_SAMPLES[config & 3];
  if (config < HYBRID_CONFIGS) return HYBRID_FRAME_SAMPLES[config & 1];
  return MUSIC_FRAME_SAMPLES[config & 3];
};

const frameCount = (data: Uint8Array): number => {
  const code = data[0] & 3;
  if (code === 0) return 1;
  if (code < 3) return 2;
  return data.length > 1 ? data[1] & FRAME_COUNT_MASK : 0;
};

const opusPacketSamples = (data: Uint8Array): number =>
  data.length === 0 ? 0 : frameSamples(data[0] >> 3) * frameCount(data);

export { opusPacketSamples };
export type { OpusPacket };
