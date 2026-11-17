/* @layer shared-storage @kind logic */
import type { ScreenPayload } from '@rotp/asset-extraction';
import { hexOf } from './hex-of';

const replacer = (_key: string, value: unknown): unknown => {
  if (value instanceof Uint16Array) return { u16: hexOf(new Uint8Array(value.buffer, value.byteOffset, value.byteLength)) };
  if (value instanceof Uint8Array) return { u8: hexOf(value) };
  return value;
};

const encodeScreens = (screens: ScreenPayload): string => JSON.stringify(screens, replacer);

export { encodeScreens };
