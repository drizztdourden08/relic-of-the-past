/* @layer bridge-wasm @kind types */

/** Which kind of transition just handed control back to the player. */
type TransitionKind =
  | 'room'      // inter-room / doorway (dungeon submodule 2)
  | 'quadrant'  // intra-room scroll (1)
  | 'doors'     // shutters, unlock, cracked (4, 5, 9)
  | 'stairs'    // inter/intra-room stairs (6, 8, 0x0E, 0x10-0x13)
  | 'entered'   // the player entered a gameplay module (in/out of a dungeon)
  | 'other';    // any remaining submodule returning to 0

interface TransitionSettled {
  kind: TransitionKind;
  /** main_module_index on the settled frame: 7 = dungeon, 9 = overworld. */
  module: number;
  /** The submodule that just finished. 0 when kind is 'entered'. */
  fromSubmodule: number;
  isIndoors: boolean;
  roomIndex: number;
  owScreenIndex: number;
}

type TransitionListener = (event: TransitionSettled) => void;

export type { TransitionKind, TransitionSettled, TransitionListener };
