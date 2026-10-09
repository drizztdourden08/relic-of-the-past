/* @layer renderer-lib @kind logic */
import { ascii } from './ascii';
import {
  OPUS_HEAD_BYTES, OPUS_MAPPING_FAMILY_PLAIN, OPUS_OUTPUT_GAIN, OPUS_RATE, OPUS_TAG_COMMENT_COUNT, OPUS_VERSION, VENDOR,
} from './ogg-opus.constants';

const opusHeadPacket = (channels: number, preSkip: number): Uint8Array => {
  const bytes = new Uint8Array(OPUS_HEAD_BYTES);
  const view = new DataView(bytes.buffer);
  bytes.set(ascii('OpusHead'), 0);
  bytes[8] = OPUS_VERSION;
  bytes[9] = channels;
  view.setUint16(10, preSkip, true);
  view.setUint32(12, OPUS_RATE, true);
  view.setInt16(16, OPUS_OUTPUT_GAIN, true);
  bytes[18] = OPUS_MAPPING_FAMILY_PLAIN;
  return bytes;
};

const opusTagsPacket = (): Uint8Array => {
  const vendor = ascii(VENDOR);
  const bytes = new Uint8Array(8 + 4 + vendor.length + 4);
  const view = new DataView(bytes.buffer);
  bytes.set(ascii('OpusTags'), 0);
  view.setUint32(8, vendor.length, true);
  bytes.set(vendor, 12);
  view.setUint32(12 + vendor.length, OPUS_TAG_COMMENT_COUNT, true);
  return bytes;
};

const opusHeaderPackets = { head: opusHeadPacket, tags: opusTagsPacket };

export { opusHeaderPackets };
