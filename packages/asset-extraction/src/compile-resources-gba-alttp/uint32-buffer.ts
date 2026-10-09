/* @layer shared-asset-extraction @kind logic */
const uint32Buffer = (values: readonly number[]): Buffer => {
  const result = Buffer.alloc(values.length * 4);
  values.forEach((value, index) => result.writeUInt32LE(value, index * 4));
  return result;
};

export { uint32Buffer };
