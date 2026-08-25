/* @layer renderer-lib @kind logic */
/**
 * The `.opuz` container from the upstream decompilation: Opus packets in a wrapper of its own,
 * built so a player can seek straight to the loop point instead of decoding from the top. Every
 * field is little-endian.
 *
 *   +0  u32   magic — the bytes O,P,U,Z, i.e. "OPUZ" read as a uint32
 *   +4  u32   unused here (the sibling `.pcm` header keeps its loop point in these four bytes)
 *   +8        the range table, ten bytes per record, first record at +8:
 *       +0  u32   file offset where this range's packet stream starts
 *       +4  u32   how many samples to play from this range
 *       +8  u16   bits 0..13  samples to drop before the range's audio begins
 *                 bit 14      looping restarts at this range
 *                 bit 15      after this range, jump back to the range bit 14 marked
 *
 * A record without bit 15 continues at the next record, ten bytes on; a record offset of zero
 * ends playback. Ranges may overlap in the file, because the loop range starts a little ahead
 * of the loop point and its drop count covers the difference — that run-up is what lets an
 * Opus decoder resume mid-stream without an audible seam.
 *
 * A range's packet stream is a run of framed packets:
 *
 *   u16   bits 0..14  packet length in bytes, never above 1275 (the length excludes itself)
 *         bit 15      the packet's first byte was left out and is 0xfc
 *   ...   that many bytes of Opus packet
 *
 * That elided byte is the mode marker for fullband stereo in 20 ms frames, which nearly every
 * packet in a music track uses, so dropping it saves a byte apiece. The audio is always 48 kHz
 * stereo in frames of at most 20 ms, matching the decoder the C player built for it.
 */
import { opusPacketSamples } from './opus-packets';
import type { OpusPacket } from './opus-packets';

const OPUZ_HEADER_BYTES = 8;
const OPUZ_RANGE_BYTES = 10;
const OPUZ_SAMPLE_RATE = 48000;
const OPUZ_CHANNELS = 2;
/** Fullband stereo, 20 ms, one frame — the mode marker the framing bit stands in for. */
const OPUZ_IMPLIED_TOC = 0xfc;
const OPUZ_MAX_PACKET_BYTES = 1275;
const SIZE_MASK = 0x7fff;
const IMPLIED_TOC_FLAG = 0x8000;
const DROP_MASK = 0x3fff;
const LOOP_START_FLAG = 0x4000;
const LOOP_BACK_FLAG = 0x8000;

interface OpuzRange {
  packets: OpusPacket[];
  /** Samples to discard from the front of this range's decoded audio. */
  drop: number;
  /** Samples to keep after the dropped ones. */
  samples: number;
}

interface OpuzAudio {
  ranges: OpuzRange[];
  /** Index of the range playback returns to, or null when the track plays once and stops. */
  loopRange: number | null;
  sampleRate: number;
  channels: number;
}

const hasOpuzMagic = (bytes: Uint8Array): boolean =>
  bytes.byteLength >= OPUZ_HEADER_BYTES &&
  bytes[0] === 0x4f && bytes[1] === 0x50 && bytes[2] === 0x55 && bytes[3] === 0x5a;

const withImpliedToc = (body: Uint8Array): Uint8Array => {
  const packet = new Uint8Array(body.length + 1);
  packet[0] = OPUZ_IMPLIED_TOC;
  packet.set(body, 1);
  return packet;
};

/** Reads framed packets from `start` until they cover `wanted` samples, or the data runs out. */
const readPackets = (bytes: Uint8Array, view: DataView, start: number, wanted: number): OpusPacket[] => {
  const packets: OpusPacket[] = [];
  let at = start;
  let covered = 0;

  while (covered < wanted && at + 2 <= bytes.byteLength) {
    const framing = view.getUint16(at, true);
    const size = framing & SIZE_MASK;
    if (size === 0 || size > OPUZ_MAX_PACKET_BYTES || at + 2 + size > bytes.byteLength) break;
    const body = bytes.subarray(at + 2, at + 2 + size);
    const data = (framing & IMPLIED_TOC_FLAG) !== 0 ? withImpliedToc(body) : body;
    const samples = opusPacketSamples(data);
    if (samples === 0) break;
    packets.push({ data, samples });
    covered += samples;
    at += 2 + size;
  }
  return packets;
};

const parseOpuz = (bytes: Uint8Array): OpuzAudio => {
  if (!hasOpuzMagic(bytes)) throw new Error('Not an .opuz file: missing OPUZ magic');

  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  const ranges: OpuzRange[] = [];
  const seen = new Map<number, number>();
  let at = OPUZ_HEADER_BYTES;
  let loopBackTo = 0;
  let loopRange: number | null = null;

  for (;;) {
    if (at === 0 || at + OPUZ_RANGE_BYTES > bytes.byteLength) break;
    const already = seen.get(at);
    if (already !== undefined) {
      loopRange = already;
      break;
    }
    seen.set(at, ranges.length);

    const offset = view.getUint32(at, true);
    const samples = view.getUint32(at + 4, true);
    const flags = view.getUint16(at + 8, true);
    if ((flags & LOOP_START_FLAG) !== 0) loopBackTo = at;
    if (samples === 0 || offset < OPUZ_HEADER_BYTES || offset >= bytes.byteLength) break;

    const drop = flags & DROP_MASK;
    ranges.push({ packets: readPackets(bytes, view, offset, drop + samples), drop, samples });
    at = (flags & LOOP_BACK_FLAG) !== 0 ? loopBackTo : at + OPUZ_RANGE_BYTES;
  }

  if (ranges.length === 0) throw new Error('Unusable .opuz file: its range table names no audio');
  return { ranges, loopRange, sampleRate: OPUZ_SAMPLE_RATE, channels: OPUZ_CHANNELS };
};

export { parseOpuz, hasOpuzMagic, OPUZ_HEADER_BYTES, OPUZ_RANGE_BYTES, OPUZ_SAMPLE_RATE, OPUZ_CHANNELS };
export type { OpuzAudio, OpuzRange };
