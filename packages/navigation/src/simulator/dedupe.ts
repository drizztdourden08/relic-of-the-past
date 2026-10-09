/* @layer bridge-wasm @kind logic */
import type { SimExit } from '../simulation';

const dedupe = (exits: SimExit[]): SimExit[] => {
  const seen = new Set<string>();
  return exits.filter((e) => {
    const key = `${e.to}#${e.edgeSig ?? ''}`;
    return seen.has(key) ? false : (seen.add(key), true);
  });
};

export { dedupe };
