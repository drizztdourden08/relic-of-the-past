/* @layer shared-asset-extraction @kind logic */
/**
 * Reads one named asset back out of a compiled container.
 *
 * The container carries its asset names as a null-terminated list, so a consumer can find an
 * asset by name instead of hard-coding its position — the engine reads positionally, but on
 * this side the name is the stable contract.
 */

/** Fixed header: 16-byte signature tag + 32-byte key hash + count + key-block length. */
const HEADER_BYTES = 48 + 8;

const readNamedAsset = (container: Buffer, name: string): Buffer => {
  const count = container.readUInt32LE(48 + 32);
  const keyLength = container.readUInt32LE(48 + 32 + 4);
  const sizesAt = HEADER_BYTES + 32;
  const namesAt = sizesAt + count * 4;
  const names = container.subarray(namesAt, namesAt + keyLength).toString('utf8').split('\0');
  const index = names.indexOf(name);
  if (index < 0) throw new Error(`Asset "${name}" is not in this container`);

  let offset = namesAt + keyLength;
  for (let i = 0; i <= index; i++) {
    offset = (offset + 3) & ~3;
    if (i === index) return container.subarray(offset, offset + container.readUInt32LE(sizesAt + i * 4));
    offset += container.readUInt32LE(sizesAt + i * 4);
  }
  throw new Error('unreachable');
};

export { readNamedAsset };
