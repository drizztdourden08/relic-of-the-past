/* @layer scripts @kind tooling */
const copyLiteral = (input, state) => {
  if (state.source >= input.length) throw new Error('Truncated GBA LZ77 literal');
  state.output[state.destination++] = input[state.source++];
};

const copyBackReference = (input, state) => {
  if (state.source + 1 >= input.length) throw new Error('Truncated GBA LZ77 back-reference');
  const first = input[state.source++];
  const second = input[state.source++];
  const length = (first >>> 4) + 3;
  const displacement = ((first & 0x0f) << 8 | second) + 1;
  if (displacement > state.destination) throw new Error('Invalid GBA LZ77 back-reference displacement');
  for (let i = 0; i < length && state.destination < state.outputSize; i++) {
    state.output[state.destination] = state.output[state.destination - displacement];
    state.destination++;
  }
};

const decodeFlagGroup = (input, state) => {
  if (state.source >= input.length) throw new Error('Truncated GBA LZ77 flag byte');
  const flags = input[state.source++];
  for (let bit = 7; bit >= 0 && state.destination < state.outputSize; bit--) {
    if ((flags & (1 << bit)) === 0) copyLiteral(input, state);
    else copyBackReference(input, state);
  }
};

const decompressGbaLz77 = (input, offset = 0) => {
  if (input[offset] !== 0x10) throw new Error(`Expected GBA LZ77 type 0x10 at offset 0x${offset.toString(16)}`);
  const outputSize = input[offset + 1] | (input[offset + 2] << 8) | (input[offset + 3] << 16);
  const state = { output: Buffer.alloc(outputSize), outputSize, source: offset + 4, destination: 0 };

  while (state.destination < outputSize) decodeFlagGroup(input, state);

  return { output: state.output, compressedSize: state.source - offset };
};

export { decompressGbaLz77 };
