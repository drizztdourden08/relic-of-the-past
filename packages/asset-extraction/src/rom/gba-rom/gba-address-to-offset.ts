/* @layer shared-asset-extraction @kind logic */
const gbaAddressToOffset = (address: number): number => {
  if (!Number.isInteger(address) || address < 0x08000000 || address > 0x09ffffff) {
    throw new Error(`Invalid GBA Game Pak address 0x${address.toString(16)}`);
  }
  return address & 0x01ffffff;
};

export { gbaAddressToOffset };
