/* @layer scripts @kind tooling */
const decompressGbaLz77 = (input, offset = 0) => {
  if (input[offset] !== 0x10) throw new Error(`Expected GBA LZ77 type 0x10 at offset 0x${offset.toString(16)}`);
  const outputSize = input[offset + 1] | (input[offset + 2] << 8) | (input[offset + 3] << 16);
  const output = Buffer.alloc(outputSize);
  let source = offset + 4;
  let destination = 0;

  while (destination < outputSize) {
    if (source >= input.length) throw new Error('Truncated GBA LZ77 flag byte');
    const flags = input[source++];
    for (let bit = 7; bit >= 0 && destination < outputSize; bit--) {
      if ((flags & (1 << bit)) === 0) {
        if (source >= input.length) throw new Error('Truncated GBA LZ77 literal');
        output[destination++] = input[source++];
        continue;
      }

      if (source + 1 >= input.length) throw new Error('Truncated GBA LZ77 back-reference');
      const first = input[source++];
      const second = input[source++];
      const length = (first >>> 4) + 3;
      const displacement = ((first & 0x0f) << 8 | second) + 1;
      if (displacement > destination) throw new Error('Invalid GBA LZ77 back-reference displacement');
      for (let i = 0; i < length && destination < outputSize; i++) {
        output[destination] = output[destination - displacement];
        destination++;
      }
    }
  }

  return { output, compressedSize: source - offset };
};

export { decompressGbaLz77 };
