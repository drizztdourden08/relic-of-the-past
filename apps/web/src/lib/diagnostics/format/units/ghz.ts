/* @layer renderer-lib @kind logic */
const ghz = (mhz: number): string => (mhz > 0 ? `${(mhz / 1000).toFixed(2)} GHz` : 'unknown');

export { ghz };
