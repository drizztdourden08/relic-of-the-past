/* @layer shared-storage @kind logic */
import type { ScreenPayload } from '@rotp/asset-extraction';
import { bytesOfHex } from './bytes-of-hex';

const reviver = (_key: string, value: unknown): unknown => {
  if (typeof value !== 'object' || value === null) return value;
  const encoded = value as { u8?: unknown; u16?: unknown };
  if (typeof encoded.u8 === 'string') return bytesOfHex(encoded.u8);
  if (typeof encoded.u16 === 'string') {
    const bytes = bytesOfHex(encoded.u16);
    return new Uint16Array(bytes.buffer, 0, bytes.byteLength >> 1);
  }
  return value;
};

const decodeScreens = (text: string): ScreenPayload => JSON.parse(text, reviver) as ScreenPayload;

export { decodeScreens };
