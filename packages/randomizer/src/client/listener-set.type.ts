/* @layer bridge-wasm @kind types */
interface ListenerSet<A extends unknown[]> {
  readonly size: number;
  add(listener: (...args: A) => void): () => void;
  emit(...args: A): void;
}

export type { ListenerSet };
