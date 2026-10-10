/* @layer shared-asset-extraction @kind logic */
const saveChecksum = (data: Uint8Array): number => {
  if (data.length === 0 || (data.length & 1) !== 0) throw new Error('Save checksum data must have a positive even length');
  let sum = 0;
  for (let offset = 0, remaining = data.length; offset < data.length; offset += 2, remaining -= 2) {
    sum = (sum + (((data[offset] ?? 0) | ((data[offset + 1] ?? 0) << 8)) ^ remaining)) & 0xffff;
  }
  return sum;
};

export { saveChecksum };
