/* @layer shared-asset-extraction @kind types */
/**
 * The engine's own room-object drawer, exposed as a probe.
 *
 * Rebuilding a stream from a pre-expanded tilemap needs to know what every object draws, and
 * the only honest source of that is the engine itself. A probe draws exactly one object, door
 * or template into scratch tilemaps and reports the cells it wrote; the solver treats it as a
 * black box, so nothing about the drawer is ever reimplemented on this side.
 */

/** One written cell: index in the 64x64 grid, layer (0 lower / 1 upper), tile word. */
interface ProbeCell {
  cell: number;
  layer: number;
  word: number;
}

interface RoomDrawProbe {
  /** Draw one object; `word`/`index` are the stream entry's three bytes. */
  drawObject(word: number, index: number, upper: number, stateBits: number): ProbeCell[];
  /** Draw one two-byte door record; door positions are absolute, not translatable. */
  drawDoor(word: number, upper: number): ProbeCell[];
  /** Draw one of the eight shared layout templates. */
  drawTemplate(layout: number): ProbeCell[];
}

/** The engine build the probe host instantiates: the Emscripten glue and its wasm binary. */
interface EngineBundle {
  glueSource: string;
  wasmBinary: Uint8Array;
  /** Node hosts pass a working `require`/`__dirname` for the glue; others leave them unset. */
  hostRequire?: unknown;
  hostDirname?: string;
}

export type { EngineBundle, ProbeCell, RoomDrawProbe };
