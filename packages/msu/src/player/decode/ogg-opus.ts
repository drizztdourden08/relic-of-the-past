/* @layer renderer-lib @kind logic */
import type { OpusPacket } from './opus-packets';
import type { OggOpusOptions, OggPage } from './ogg-opus.type';
import { OGG_FLAG_BOS, OGG_FLAG_EOS, OGG_LACING_UNIT, OGG_MAX_SEGMENTS } from './ogg-opus.constants';
import { buildOggPage } from './ogg-page';
import { opusHeaderPackets } from './opus-header-packets';

const segmentCount = (byteLength: number): number => Math.floor(byteLength / OGG_LACING_UNIT) + 1;

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
    { flags: OGG_FLAG_BOS, granule: 0, sequence: 0, packets: [opusHeaderPackets.head(channels, preSkip)] },
    { flags: 0, granule: 0, sequence: 1, packets: [opusHeaderPackets.tags()] },
    ...audioPages(packets),
  ];
  pages.forEach((page, i) => { page.sequence = i; });
  const lastPage = pages.at(-1);
  if (lastPage === undefined) throw new Error('An Ogg-Opus stream has no pages');
  lastPage.flags |= OGG_FLAG_EOS;

  const built = pages.map((page) => buildOggPage(page, serial));
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
