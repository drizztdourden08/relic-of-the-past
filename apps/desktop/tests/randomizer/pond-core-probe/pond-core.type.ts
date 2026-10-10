/* @layer tests @kind type */
interface Core {
  ccall: (name: string, ret: 'number' | null, types: string[], args: number[]) => number;
  HEAPU8: Uint8Array;
  FS: { mkdir: (path: string) => void; writeFile: (path: string, data: Uint8Array) => void };
}

type PondRig = {
  call: (name: string, ...args: number[]) => number;
  set8: (addr: number, value: number) => void;
  get8: (addr: number) => number;
  set16: (addr: number, value: number) => void;
  get16: (addr: number) => number;
  gate3: (word: number) => void;
  armPlan: () => void;
  seam: (kind: number) => number;
};

export type { Core, PondRig };
