/* @layer shared-asset-extraction @kind logic */
import type { GbaRomReader } from '../../../rom/gba-rom';
import type { GbaAlttpTextMessage } from './text-source.type';
import { ROM_ADDRESS_END, TEXT_COUNT, TEXT_END } from './text-source.constants';
import { decodeTextByte } from './decode-text-byte';
import { textAddress } from './text-address';
import { toPlainText } from './to-plain-text';

const extractGbaAlttpText = (rom: GbaRomReader): GbaAlttpTextMessage[] => {
  const addresses = Array.from({ length: TEXT_COUNT }, (_, id) => textAddress(rom, id));
  return addresses.map((start, id) => {
    const end = id + 1 < addresses.length ? addresses[id + 1] : TEXT_END;
    if (end < start || end > ROM_ADDRESS_END) throw new Error(`Invalid text bounds for ID 0x${id.toString(16)}`);
    const bytes = Buffer.from(Array.from({ length: end - start }, (_, offset) => decodeTextByte(rom, start + offset)));
    return { id, address: start, bytes, plainText: toPlainText(bytes) };
  });
};

export { extractGbaAlttpText };
