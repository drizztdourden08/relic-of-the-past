/* @layer shared-asset-extraction @kind logic */
const produceLoadableSeq = (serializer_memory: (number | null)[]): Buffer => {
  const chunks: Buffer[] = [];
  let start = 0;

  while (start < 0x10000) {
    while (start < 0x10000 && serializer_memory[start] === null) start++;
    if (start >= 0x10000) break;

    let end = start;
    while (end < 0x10000 && serializer_memory[end] !== null) end++;

    const len = end - start;
    const header = Buffer.alloc(4);
    header.writeUInt16LE(len, 0);
    header.writeUInt16LE(start, 2);
    chunks.push(header);

    const data = Buffer.alloc(len);
    for (let i = 0; i < len; i++) {
      data[i] = serializer_memory[start + i]!;
    }
    chunks.push(data);
    start = end;
  }

  chunks.push(Buffer.alloc(2));
  return Buffer.concat(chunks);
};

export { produceLoadableSeq };
