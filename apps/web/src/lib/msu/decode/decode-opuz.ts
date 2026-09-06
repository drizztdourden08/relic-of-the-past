/* @layer renderer-lib @kind logic */
/**
 * Plays `.opuz` by repackaging it, not by decoding it ourselves. The container's payload is
 * ordinary Opus, and Chromium already has an Opus decoder that just will not read this
 * container. So each range's packets get wrapped in an Ogg stream in memory and handed to
 * `decodeAudioData`, which costs us a muxer and no codec at all.
 *
 * Each range is its own stream because a range is a seek: the decoder has to start clean, the
 * way the C player reset its decoder before every seek. The samples a range asks us to drop are
 * dropped here, not declared as the stream's pre-skip, so the trimming happens in one
 * place and cannot be applied twice.
 *
 * Ranges are laid end to end into a single buffer, which turns the container's "jump back to
 * this range" into the plain loop point the rest of the engine expects: the sample the loop
 * range's audio starts at, at the buffer's own 48 kHz rate. Decoding runs in a private 48 kHz
 * context so no resampling can shift those sample counts. The finished buffer keeps its 48 kHz
 * rate and the graph resamples it to the device rate on playback.
 */
import { buildOggOpus } from './ogg-opus';
import { parseOpuz, OPUZ_CHANNELS, OPUZ_SAMPLE_RATE } from './parse-opuz';
import type { DecodedAudio } from './decode-audio-file';
import type { OpuzRange } from './parse-opuz';

let scratchContext: OfflineAudioContext | null = null;

/** A context at the codec's own rate, so `decodeAudioData` returns samples untouched. */
const scratch = (): OfflineAudioContext => {
  scratchContext ??= new OfflineAudioContext(OPUZ_CHANNELS, 1, OPUZ_SAMPLE_RATE);
  return scratchContext;
};

const channelSlices = (decoded: AudioBuffer, from: number, to: number): Float32Array<ArrayBuffer>[] => {
  const slices: Float32Array<ArrayBuffer>[] = [];
  for (let channel = 0; channel < OPUZ_CHANNELS; channel += 1) {
    const source = decoded.getChannelData(Math.min(channel, decoded.numberOfChannels - 1));
    // `subarray` widens the backing buffer to ArrayBufferLike; a decoded AudioBuffer is never
    // shared memory, so narrowing it back is safe and keeps this a view, not a copy.
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
