/* @layer tests @kind type */
type SetModule = (mod: never) => void;

interface FakeModule {
  readonly calls: string[];
  readonly reads: string[];
  readonly files: ReadonlyMap<string, Uint8Array>;
  setReturn(name: string, value: number): void;
  clear(): void;
  remove(): void;
}

export type { FakeModule, SetModule };
