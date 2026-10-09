/* @layer tests @kind helper */
import { unpackPackedBytes } from '@rotp/asset-extraction';
import type { FakeModule, SetModule } from './ap-fake-module.type';

const isRead = (name: string): boolean => /^Wasm(Get|Can|Is|Read|Probe)/.test(name) || name === 'WasmForeignItemId';

const RETURNS: Readonly<Record<string, number>> = { WasmForeignItemId: 0xfe };

const checksum = (bytes: Uint8Array): number => bytes.reduce((sum, byte) => (sum * 31 + byte) >>> 0, 7);

const SESSION_DIALOGUE_FILE = '/session_dialogue.bin';

const sessionDialogueLines = (blob: Uint8Array | undefined): number =>
  (blob === undefined ? 0 : unpackPackedBytes(unpackPackedBytes(blob)[1] ?? new Uint8Array(0)).length);

const answerEveryWasmExport = (base: Record<string, unknown>): Record<string, unknown> => new Proxy(base, {
  get: (target, key) => (typeof key === 'string' && key.startsWith('_Wasm') && !(key in target)
    ? () => 1 : target[key as string]),
});

const installFakeModule = (setModule: SetModule): FakeModule => {
  const calls: string[] = [];
  const reads: string[] = [];
  const files = new Map<string, Uint8Array>();
  const heap = new ArrayBuffer(1 << 20);
  let nextPointer = 16;
  const returns = new Map<string, number>(Object.entries(RETURNS));
  const base: Record<string, unknown> = {
    ccall: (name: string, _ret: string | null, _types: string[], args: unknown[]) => {
      (isRead(name) ? reads : calls).push(`${name}(${JSON.stringify(args)})`);
      if (name === 'WasmLoadSessionDialogue') return sessionDialogueLines(files.get(SESSION_DIALOGUE_FILE));
      return returns.get(name) ?? 1;
    },
    FS: {
      writeFile: (path: string, bytes: Uint8Array) => {
        files.set(path, bytes);
        calls.push(`FS.writeFile(${path}, ${bytes.length}, ${checksum(bytes)})`);
      },
      readFile: () => new Uint8Array(0),
      unlink: () => undefined,
    },
    _malloc: (size: number) => {
      const pointer = nextPointer;
      nextPointer += size + 8;
      return pointer;
    },
    _free: () => undefined,
    HEAPU8: new Uint8Array(heap),
    HEAP8: new Int8Array(heap),
    HEAPU16: new Uint16Array(heap),
    HEAP16: new Int16Array(heap),
    HEAPU32: new Uint32Array(heap),
    HEAP32: new Int32Array(heap),
  };
  setModule(answerEveryWasmExport(base) as never);
  return {
    calls,
    reads,
    files,
    setReturn: (name, value) => { returns.set(name, value); },
    clear: () => {
      calls.length = 0;
      reads.length = 0;
      files.clear();
    },
    remove: () => setModule(null as never),
  };
};

export { installFakeModule };
