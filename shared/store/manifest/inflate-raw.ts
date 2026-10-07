/* @layer shared-store @kind logic */
/**
 * Inflates one raw DEFLATE stream through the platform's DecompressionStream, which Node,
 * Electron and every current browser provide, so no library travels with it. Reading stops
 * as soon as the output passes `maxBytes`, so a small entry cannot expand without bound.
 */

/** The inflated bytes, or null when the stream is damaged or grows past `maxBytes`. */
const inflateRaw = async (data: Uint8Array, maxBytes: number): Promise<Uint8Array | null> => {
  const source = new Blob([data.slice()]).stream().pipeThrough(new DecompressionStream('deflate-raw'));
  const reader = source.getReader();
  const chunks: Uint8Array[] = [];
  let total = 0;
  try {
    for (;;) {
      const { done, value } = await reader.read();
      if (done) break;
      total += value.byteLength;
      if (total > maxBytes) {
        await reader.cancel();
        return null;
      }
      chunks.push(value);
    }
  } catch {
    return null;
  }
  const out = new Uint8Array(total);
  let at = 0;
  for (const chunk of chunks) {
    out.set(chunk, at);
    at += chunk.byteLength;
  }
  return out;
};

export { inflateRaw };
