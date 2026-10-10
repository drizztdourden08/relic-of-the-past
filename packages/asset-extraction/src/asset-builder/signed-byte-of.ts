/* @layer shared-asset-extraction @kind logic */
const signedByteOf = (value: number): number => {
  if (!(value & 0xff)) return 0;
  return value > 127 ? value - 256 : value;
};

export { signedByteOf };
