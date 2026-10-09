/* @layer renderer-components @kind logic */
const canonicalTrackName = (prefix: string, trackNum: number, ext: string): string =>
  `${prefix}${trackNum}.${ext}`;

export { canonicalTrackName };
