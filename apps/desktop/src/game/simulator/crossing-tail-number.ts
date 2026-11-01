/* @layer bridge-wasm @kind logic */
const tailNumber = (id: string): number => Number(id.slice(id.indexOf(':') + 1));

export { tailNumber };
