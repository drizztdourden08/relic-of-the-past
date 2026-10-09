/* @layer bridge-wasm @kind types */
interface Resolver {
  drawn: ReadonlySet<string>;
  tokens: ReadonlyMap<string, string>;
}

export type { Resolver };
