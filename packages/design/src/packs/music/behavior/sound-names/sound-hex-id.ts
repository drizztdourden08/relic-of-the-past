/* @layer renderer-components @kind logic */
const soundHexId = (soundId: number): string =>
  `0x${soundId.toString(16).toUpperCase().padStart(2, '0')}`;

export { soundHexId };
