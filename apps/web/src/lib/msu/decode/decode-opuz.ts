/* @layer renderer-lib @kind logic */
import { buildOggOpus } from './ogg-opus';
import { parseOpuz, OPUZ_CHANNELS, OPUZ_SAMPLE_RATE } from './parse-opuz';
import type { DecodedAudio } from './decode-audio-file';
import type { OpuzRange } from './parse-opuz';

let scratchContext: OfflineAudioContext | null = null;

const scratch = (): OfflineAudioContext => {
  scratchContext ??= new OfflineAudioContext(OPUZ_CHANNELS, 1, OPUZ_SAMPLE_RATE);
  return scratchContext;
};

const channelSlices = (decoded: AudioBuffer, from: number, to: number): Float32Array<ArrayBuffer>[] => {
  const slices: Float32Array<ArrayBuffer>[] = [];
  for (let channel = 0; channel < OPUZ_CHANNELS; channel += 1) {
    const source = decoded.getChannelData(Math.min(channel, decoded.numberOfChannels - 1));
    slices.push(source.subarray(from, to) as Float32Array<ArrayBuffer>);
  }
  return slices;
};

const decodeRange = async (range: OpuzRange): Promise<Float32Array<ArrayBuffer>[]> => {
  const { packets, drop, samples } = range;
  const stream = buildOggOpus(packets, { channels: OPUZ_CHANNELS, preSkip: 0 });
  const decoded = await scratch().decodeAudioData(stream.buffer as ArrayBuffer);
  const from = Math.min(drop, decoded.length);
  return channelSlices(decoded, from, Math.min(from + samples, decoded.length));
};

const decodeOpuz = async (ctx: BaseAudioContext, bytes: Uint8Array): Promise<DecodedAudio> => {
  const { ranges, loopRange } = parseOpuz(bytes);
  const parts = await Promise.all(ranges.map((range) => decodeRange(range)));
  const lengths = parts.map((part) => part[0].length);
  const total = lengths.reduce((sum, n) => sum + n, 0);
  if (total === 0) throw new Error('Unusable .opuz file: its packets decoded to no audio');

  const buffer = ctx.createBuffer(OPUZ_CHANNELS, total, OPUZ_SAMPLE_RATE);
  let at = 0;
  parts.forEach((part, i) => {
    part.forEach((data, channel) => buffer.copyToChannel(data, channel, at));
    at += lengths[i];
  });

  const loopSample = loopRange === null
    ? 0
    : lengths.slice(0, loopRange).reduce((sum, n) => sum + n, 0);
  return { buffer, loopSample };
};

export { decodeOpuz };
