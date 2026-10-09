/* @layer bridge-wasm @kind logic */
const boolToIni = (v: boolean): string => {
  return v ? '1' : '0';
};

export { boolToIni };
