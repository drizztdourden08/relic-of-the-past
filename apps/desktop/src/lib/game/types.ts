export interface EmscriptenFS {
  writeFile(path: string, data: Uint8Array | string): void;
  mkdir(path: string): void;
  readdir(path: string): string[];
  readFile(path: string): Uint8Array;
  analyzePath(path: string): { exists: boolean };
}

export interface EmscriptenModule {
  FS: EmscriptenFS;
  ccall(ident: string, returnType: string | null, argTypes: string[], args: unknown[]): unknown;
}

export type GameStatus = 'idle' | 'loading' | 'running' | 'error';

export interface GameState {
  status: GameStatus;
  error: string | null;
}
