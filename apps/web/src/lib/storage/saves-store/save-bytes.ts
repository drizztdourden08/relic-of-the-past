/* @layer renderer-lib @kind logic */
import { stampStateBuffer } from '@app/lib/game/state-stamp';

const u8 = (ab: ArrayBuffer): Uint8Array => new Uint8Array(ab);

const toBase64 = (data: Uint8Array | null): string | null => {
  if (!data) return null;
  let binary = '';
  const chunk = 0x8000;
  for (let i = 0; i < data.length; i += chunk) binary += String.fromCharCode(...data.subarray(i, i + chunk));
  return btoa(binary);
};

const saveBytes = {
  u8,
  stamped: async (ab: ArrayBuffer): Promise<Uint8Array> => u8(await stampStateBuffer(ab)),
  toArrayBuffer: (data: Uint8Array | null): ArrayBuffer | null =>
    (data ? (data.buffer.slice(data.byteOffset, data.byteOffset + data.byteLength) as ArrayBuffer) : null),
  toBase64,
  optional: (ab?: ArrayBuffer): Uint8Array | undefined => (ab ? new Uint8Array(ab) : undefined),
};

export { saveBytes };
