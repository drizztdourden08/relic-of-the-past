/* @layer renderer-lib @kind logic */
import { opusPacketSamples } from '../opus-packets';
import type { OpusPacket } from '../opus-packets';
import { IMPLIED_TOC_FLAG, OPUZ_IMPLIED_TOC, OPUZ_MAX_PACKET_BYTES, SIZE_MASK } from './parse-opuz.constants';

const withImpliedToc = (body: Uint8Array): Uint8Array => {
  const packet = new Uint8Array(body.length + 1);
  packet[0] = OPUZ_IMPLIED_TOC;
  packet.set(body, 1);
  return packet;
};

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

export { readPackets };
