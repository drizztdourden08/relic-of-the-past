/* @layer bridge-wasm @kind logic */
/**
 * The identity a save keeps of its multiworld room: a 32-bit FNV-1a hash of the room's seed
 * name, over its UTF-8 bytes. Zero is what a save with no room holds, so a hash that comes out
 * zero is stored as 1.
 */

const FNV_OFFSET = 0x811c9dc5;
const FNV_PRIME = 0x01000193;

const roomHashOf = (seedName: string): number => {
  let hash = FNV_OFFSET;
  for (const byte of new TextEncoder().encode(seedName)) {
    hash = Math.imul(hash ^ byte, FNV_PRIME) >>> 0;
  }
  return hash === 0 ? 1 : hash;
};

export { roomHashOf };
