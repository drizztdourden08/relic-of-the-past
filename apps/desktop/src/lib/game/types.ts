interface EmscriptenFS {
  writeFile(path: string, data: Uint8Array | string): void;
  mkdir(path: string): void;
  readdir(path: string): string[];
  readFile(path: string): Uint8Array;
  analyzePath(path: string): { exists: boolean };
  unlink(path: string): void;
}

interface EmscriptenModule {
  FS: EmscriptenFS;
  HEAPU8: Uint8Array;
  ccall(ident: string, returnType: 'number', argTypes: string[], args: unknown[]): number;
  ccall(ident: string, returnType: 'string', argTypes: string[], args: unknown[]): string;
  ccall(ident: string, returnType: string | null, argTypes: string[], args: unknown[]): unknown;
}

type GameStatus = 'idle' | 'loading' | 'running' | 'error';

interface GameState {
  status: GameStatus;
  error: string | null;
}

export type {
  EmscriptenFS,
  EmscriptenModule,
  GameState,
  GameStatus
};
