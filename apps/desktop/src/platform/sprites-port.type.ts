/* @layer renderer-other @kind types */
interface SpritesPort {
  baseUrl: (romFile: string) => Promise<string>;
}

export type { SpritesPort };
