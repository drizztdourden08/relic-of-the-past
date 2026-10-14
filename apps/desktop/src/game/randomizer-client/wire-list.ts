/* @layer bridge-wasm @kind logic */
const wireList = <T>(list: T[] | undefined): T[] => list ?? [];

export { wireList };
