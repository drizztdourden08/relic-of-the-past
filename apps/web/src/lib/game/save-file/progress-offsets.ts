/* @layer bridge-wasm @kind logic */
/**
 * Offline mirror of the live progress buffer (WasmGetProgressFlags,
 * core/game-hooks/state_queries.c): each buffer index mapped to the byte
 * offset of its source variable INSIDE one battery-save file block (the
 * variable's save-block address minus the block base, 0xF000). Keep in
 * lockstep with the C buffer's layout comment.
 *
 * Index 12 (the sleep step counter) lives in live WRAM only and has no
 * offline source; its check still resolves through the progress-indicator
 * fallback (check-facts.ts), which reads index 0.
 *
 * The rows sourced from a HOOK-OWNED byte come from `hook-save-bytes.ts`
 * instead of a literal, so this table cannot drift from the registry in
 * core/game-hooks/save_bytes.h. The rest are vanilla variables.h addresses.
 */
import {
  SRM_EMPTY_RUNG,
  SRM_POND_THROWS,
  SRM_SUBSTITUTION_TAKEN,
  SRM_WALLET_LADDER_INDEX,
  blockOffsetOf,
} from './hook-save-bytes';

/** Per-room 16-bit flag words, which the block starts with. */
const ROOM_FLAGS_BASE = 0x000;

/** Per-screen overworld event bytes. */
const OW_EVENT_BASE = 0x280;

const PROGRESS_OFFSETS: ReadonlyArray<number | null> = [
  0x3c5, // [0]  progress indicator
  0x3c6, // [1]  progress flags
  0x3c9, // [2]  progress indicator 3
  0x356, // [3]  swim gear
  0x355, // [4]  running gear
  0x34d, // [5]  catching net
  0x353, // [6]  reflector
  0x349, // [7]  third medallion
  0x37b, // [8]  magic consumption scale
  0x212, // [9]  room 0x109 flag word, low byte
  0x246, // [10] room 0x123 flag word, low byte
  0x23c, // [11] room 0x11E flag word, low byte
  null, //  [12] sleep step counter, live WRAM only, no offline source
  0x3cc, // [13] tagalong id
  0x36f, // [14] small key count
  0x366, // [15] big-key word, low byte
  0x213, // [16] room 0x109 flag word, high byte
  0x247, // [17] room 0x123 flag word, high byte
  0x23d, // [18] room 0x11E flag word, high byte
  0x3c8, // [19] starting-point id
  0x3c7, // [20] map-marker state
  blockOffsetOf(SRM_SUBSTITUTION_TAKEN), //     [21] substitution-completion bits, byte 0
  blockOffsetOf(SRM_SUBSTITUTION_TAKEN + 1), // [22] substitution-completion bits, byte 1
  0x370, // [23] explosives tier byte (the pond's persisted purchase level, kind 0)
  0x371, // [24] projectiles tier byte (the pond's persisted purchase level, kind 1)
  blockOffsetOf(SRM_SUBSTITUTION_TAKEN + 2), // [25] substitution-completion bits, byte 2
  blockOffsetOf(SRM_WALLET_LADDER_INDEX), //    [26] wallet ladder index; 0 on a vanilla file
  blockOffsetOf(SRM_EMPTY_RUNG), //             [27] explosives empty-rung flag (1 while a
  //                                                 Custom family sits below its grid)
  blockOffsetOf(SRM_EMPTY_RUNG + 1), //         [28] projectiles empty-rung flag
  blockOffsetOf(SRM_EMPTY_RUNG + 2), //         [29] meter empty-rung flag
  blockOffsetOf(SRM_POND_THROWS), //            [30] throws taken out of a planned pond
  //                                                 (0 on any file that never met a plan);
  //                                                 the completion fact of its prize slots
];

export { OW_EVENT_BASE, PROGRESS_OFFSETS, ROOM_FLAGS_BASE };
