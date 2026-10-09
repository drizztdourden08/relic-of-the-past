/* @layer renderer-lib @kind types */
interface OggPage {
  flags: number;
  granule: number;
  sequence: number;
  packets: Uint8Array[];
}

interface OggOpusOptions {
  channels: number;
  preSkip: number;
}

export type { OggPage, OggOpusOptions };
