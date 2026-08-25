/* @layer renderer-lib @kind logic */
/**
 * Wraps bare Opus packets in an Ogg stream, in memory, so the browser's own decoder can take
 * them. Chromium decodes Ogg-Opus natively, so this muxer is the whole of what a custom Opus
 * container needs from us — no codec, no library, no wasm.
 *
 * The stream is the layout RFC 7845 requires: an `OpusHead` identification packet alone on the
 * first page, an `OpusTags` comment packet alone on the second, then the audio packets. Every
 * page states its length as a run of "lacing" bytes — 255 for each full 255 bytes of a packet
 * then the remainder, so a packet whose length is an exact multiple of 255 needs a trailing
 * zero to mark its end — and no page may carry more than 255 of them. Packets here are at most
 * 1276 bytes, so none ever has to be split across a page boundary.
 *
 * Granule positions count decoded samples at 48 kHz from the start of the stream, and the
 * final page must be flagged end-of-stream or a demuxer keeps waiting for more.
 */
import { oggCrc32 } from './ogg-crc32';
import type { OpusPacket } from './opus-packets';

const OGG_PAGE_HEADER_BYTES = 27;
const OGG_MAX_SEGMENTS = 255;
const OGG_LACING_UNIT = 255;
const OGG_FLAG_BOS = 0x02;
const OGG_FLAG_EOS = 0x04;
const OPUS_HEAD_BYTES = 19;
const OPUS_VERSION = 1;
const OPUS_RATE = 48000;
const VENDOR = 'relic-of-the-past';
const UINT32 = 0x100000000;

interface OggPage {
  flags: number;
  granule: number;
  sequence: number;
  packets: Uint8Array[];
}

interface OggOpusOptions {
  channels: number;
  /** Samples the decoder should drop up front; zero when the caller trims them itself. */
  preSkip: number;
}

const ascii = (text: string): Uint8Array => Uint8Array.from(text, (c) => c.charCodeAt(0));

const segmentCount = (byteLength: number): number => Math.floor(byteLength / OGG_LACING_UNIT) + 1;

const laceTable = (packets: Uint8Array[]): number[] => {
  const table: number[] = [];
  packets.forEach(({ length }) => {
    let left = length;
    while (left >= OGG_LACING_UNIT) {
      table.push(OGG_LACING_UNIT);
      left -= OGG_LACING_UNIT;
    }
    table.push(left);
  });
  return table;
};

const buildPage = (page: OggPage, serial: number): Uint8Array => {
  const { flags, granule, sequence, packets } = page;
  const table = laceTable(packets);
  const bodyBytes = packets.reduce((sum, p) => sum + p.length, 0);
  const bytes = new Uint8Array(OGG_PAGE_HEADER_BYTES + table.length + bodyBytes);
  const view = new DataView(bytes.buffer);

  bytes.set(ascii('OggS'), 0);
  bytes[4] = 0; // stream structure version
  bytes[5] = flags;
  view.setUint32(6, granule % UINT32, true);
  view.setUint32(10, Math.floor(granule / UINT32), true);
  view.setUint32(14, serial, true);
  view.setUint32(18, sequence, true);
  bytes[26] = table.length;
  bytes.set(table, 27);

  let at = OGG_PAGE_HEADER_BYTES + table.length;
  packets.forEach((p) => {
    bytes.set(p, at);
    at += p.length;
  });
  // The checksum covers the page with its own four bytes left as zero, so fill it in last.
  view.setUint32(22, oggCrc32(bytes), true);
  return bytes;
};

const opusHeadPacket = (channels: number, preSkip: number): Uint8Array => {
  const bytes = new Uint8Array(OPUS_HEAD_BYTES);
  const view = new DataView(bytes.buffer);
  bytes.set(ascii('OpusHead'), 0);
  bytes[8] = OPUS_VERSION;
  bytes[9] = channels;
  view.setUint16(10, preSkip, true);
  view.setUint32(12, OPUS_RATE, true);
  view.setInt16(16, 0, true); // output gain
  bytes[18] = 0; // channel mapping family 0: mono or plain stereo
  return bytes;
};

const opusTagsPacket = (): Uint8Array => {
  const vendor = ascii(VENDOR);
  const bytes = new Uint8Array(8 + 4 + vendor.length + 4);
  const view = new DataView(bytes.buffer);
  bytes.set(ascii('OpusTags'), 0);
  view.setUint32(8, vendor.length, true);
  bytes.set(vendor, 12);
  view.setUint32(12 + vendor.length, 0, true); // no user comments
  return bytes;
};

/** Groups audio packets into pages, keeping each page inside the 255-lacing-byte limit. */
const audioPages = (packets: OpusPacket[]): OggPage[] => {
  const pages: OggPage[] = [];
  let current: Uint8Array[] = [];
  let segments = 0;
  let granule = 0;

  const flush = (): void => {
    if (current.length === 0) return;
    pages.push({ flags: 0, granule, sequence: 0, packets: current });
    current = [];
    segments = 0;
  };

  packets.forEach(({ data, samples }) => {
    const needed = segmentCount(data.length);
    if (segments + needed > OGG_MAX_SEGMENTS) flush();
    current.push(data);
    segments += needed;
    granule += samples;
  });
  flush();
  return pages;
};

const buildOggOpus = (packets: OpusPacket[], options: OggOpusOptions): Uint8Array => {
  const { channels, preSkip } = options;
  if (packets.length === 0) throw new Error('Cannot build an Ogg-Opus stream with no packets');

  const serial = 1;
  const pages: OggPage[] = [
    { flags: OGG_FLAG_BOS, granule: 0, sequence: 0, packets: [opusHeadPacket(channels, preSkip)] },
    { flags: 0, granule: 0, sequence: 1, packets: [opusTagsPacket()] },
    ...audioPages(packets),
  ];
  pages.forEach((page, i) => { page.sequence = i; });
  pages[pages.length - 1].flags |= OGG_FLAG_EOS;

  const built = pages.map((page) => buildPage(page, serial));
  const total = built.reduce((sum, p) => sum + p.length, 0);
  const stream = new Uint8Array(total);
  let at = 0;
  built.forEach((page) => {
    stream.set(page, at);
    at += page.length;
  });
  return stream;
};

export { buildOggOpus };
export type { OggOpusOptions };
