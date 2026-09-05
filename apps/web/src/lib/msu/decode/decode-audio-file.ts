/* @layer renderer-lib @kind logic */
/**
 * Turns any supported pack file into an AudioBuffer the engine can schedule.
 *
 * Three paths, each picked from the file's own leading bytes, not its name. MSU-1
 * `.pcm` is raw samples we convert ourselves (and it carries a loop point in its header);
 * `.opuz` is Opus in a container of the decompilation's own, which we repackage as Ogg so the
 * browser can decode it (it carries a loop point too); everything else goes straight to the
 * browser's decoder, which covers wav/mp3/ogg/flac/opus with no library of ours. An AudioBuffer
 * keeps its own sample rate, so the graph resamples to the device rate for free. The mismatch
 * that made 48kHz playback run fast in the C player cannot occur here.
 */
import { decodeOpuz } from './decode-opuz';
import { parseMsu1, hasMsu1Magic } from './parse-msu1';
import { hasOpuzMagic } from './parse-opuz';

interface DecodedAudio {
  buffer: AudioBuffer;
  /** Loop restart point in samples at the buffer's own rate, when the source declared one. */
  loopSample: number;
}

/** Custom Opus framing from the upstream decompilation, repackaged as Ogg before it plays. */
const isOpuzName = (fileName: string): boolean => /\.opuz$/i.test(fileName);

const decodeMsu1 = (ctx: BaseAudioContext, bytes: Uint8Array): DecodedAudio => {
  const { channels, loopSample, sampleRate } = parseMsu1(bytes);
  const buffer = ctx.createBuffer(channels.length, channels[0].length, sampleRate);
  channels.forEach((data, i) => buffer.copyToChannel(data, i));
  return { buffer, loopSample };
};

const decodeMedia = async (ctx: BaseAudioContext, bytes: Uint8Array): Promise<DecodedAudio> => {
  // decodeAudioData detaches the buffer it is given, so hand it a copy. The caller's bytes
  // may be a view into a larger array we do not own.
  const copy = new Uint8Array(bytes.byteLength);
  copy.set(bytes);
  const buffer = await ctx.decodeAudioData(copy.buffer as ArrayBuffer);
  return { buffer, loopSample: 0 };
};

const decodeAudioFile = async (ctx: BaseAudioContext, fileName: string, bytes: Uint8Array): Promise<DecodedAudio> => {
  if (hasMsu1Magic(bytes)) return decodeMsu1(ctx, bytes);
  if (hasOpuzMagic(bytes) || isOpuzName(fileName)) return decodeOpuz(ctx, bytes);
  return decodeMedia(ctx, bytes);
};

export { decodeAudioFile, isOpuzName };
export type { DecodedAudio };
