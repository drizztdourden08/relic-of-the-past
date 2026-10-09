/* @layer bridge-wasm @kind logic */
const overworldScreenId = (screenIndex: number, isDarkWorld = false): string =>
  `${isDarkWorld ? 'dw' : 'lw'}-${screenIndex.toString(16).padStart(2, '0')}`;

export { overworldScreenId };
