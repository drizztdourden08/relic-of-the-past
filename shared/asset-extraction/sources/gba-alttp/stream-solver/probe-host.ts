/* @layer shared-asset-extraction @kind logic */
/**
 * Hosts a headless instance of the engine so the solver can ask it what objects draw.
 *
 * The same Emscripten module the game runs is instantiated a second time with no canvas and no
 * main loop: the glue is evaluated from source, the wasm binary is handed over directly, the
 * freshly-compiled base asset container is written into the module's filesystem, and
 * WasmInitHeadless loads assets and initialises the core without SDL. From there the
 * WasmProbe* exports draw single objects into scratch tilemaps and report the written cells.
 *
 * Environment-agnostic on purpose: the extraction worker feeds it bytes it fetched, a Node
 * test feeds it bytes it read from disk. Nothing here touches the network or the filesystem.
 */
import type { EngineBundle, ProbeCell, RoomDrawProbe } from './probe.type';

interface EmscriptenLike {
  ccall: (name: string, ret: string, argTypes: string[], args: unknown[]) => number;
  HEAPU8: Uint8Array;
  FS: { writeFile: (path: string, data: Uint8Array) => void };
}

type ModuleFactory = (config: Record<string, unknown>) => Promise<EmscriptenLike>;

/** Read one probe result: [count u16, pad u16] then per cell [cell u16, layer u8, pad, word u16]. */
const readCells = (mod: EmscriptenLike, ptr: number): ProbeCell[] => {
  const heap = mod.HEAPU8;
  const count = heap[ptr] | (heap[ptr + 1] << 8);
  const cells: ProbeCell[] = [];
  for (let i = 0; i < count; i++) {
    const at = ptr + 4 + i * 6;
    cells.push({
      cell: heap[at] | (heap[at + 1] << 8),
      layer: heap[at + 2],
      word: heap[at + 4] | (heap[at + 5] << 8),
    });
  }
  return cells;
};

/**
 * Evaluate the glue and return its module factory.
 *
 * The glue is a MODULARIZE build: running it defines a `Zelda3` factory in its own scope, so
 * it is compiled inside a function body that hands the factory back. This works identically in
 * a browser worker and in Node, and never touches the global scope.
 */
/**
 * In Node the glue reaches for `require` and `__dirname`, which do not exist inside an
 * evaluated function in an ES module; the host supplies working ones. Browser and worker
 * hosts leave them undefined — the glue never touches them there, and the wasm binary is
 * handed over directly so no file loading happens in any environment.
 */
const compileGlue = (glueSource: string, bundle: EngineBundle): ModuleFactory =>
  new Function('require', '__dirname', `${glueSource};return Zelda3;`)(
    bundle.hostRequire, bundle.hostDirname ?? '',
  ) as ModuleFactory;

const createEngineProbe = async (bundle: EngineBundle, baseAssets: Buffer): Promise<RoomDrawProbe> => {
  const { glueSource, wasmBinary } = bundle;
  void glueSource;
  const factory = compileGlue(glueSource, bundle);
  const mod = await factory({
    wasmBinary,
    noInitialRun: true,
    preRun: [(instance: EmscriptenLike) => {
      instance.FS.writeFile('zelda3_assets.dat', new Uint8Array(baseAssets));
    }],
    print: () => { /* headless: the game's stdout is noise here */ },
    printErr: () => { /* headless */ },
  });
  const ok = mod.ccall('WasmInitHeadless', 'number', [], []);
  if (!ok) throw new Error('Headless engine initialisation failed');

  const call = (name: string, args: number[]): ProbeCell[] =>
    readCells(mod, mod.ccall(name, 'number', args.map(() => 'number'), args));

  return {
    drawObject: (word, index, upper, stateBits) =>
      call('WasmProbeDrawObjectInState', [word, index, upper, stateBits]),
    drawDoor: (word, upper) => call('WasmProbeDrawDoor', [word, upper]),
    drawTemplate: (layout) => call('WasmProbeDrawTemplate', [layout]),
  };
};

export { createEngineProbe };
