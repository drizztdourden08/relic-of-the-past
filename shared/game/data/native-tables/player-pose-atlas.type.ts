/* @layer shared-game @kind data */
/**
 * Shape of the generated player-pose atlas.
 *
 * The engine draws the player as two 16x16 sprites per frame: an upper half placed at an
 * offset the frame chooses, and a lower half always eight pixels below the origin. Each
 * half reads a 2x2 block of tiles from the sheet, and either half can be marked as not
 * drawn — so a frame legitimately carries two quads, one, or none. A frame with none is
 * deliberately invisible: the fall-into-a-hole animation uses three of them for the beats
 * after the player has gone under. A renderer must treat that as a frame, not as missing
 * data, or the animation loses its timing.
 *
 * Frames are addressed by slot because the engine shares them: 511 pose ids resolve onto
 * 303 distinct slots, so a state's animation is a list of slot numbers rather than a list
 * of inlined frames.
 */

/** A 16x16 half: four tiles read from `off`, `off + 0x20`, `off + 0x200`, `off + 0x220`. */
interface PoseQuad {
  /** Byte offset of the top-left tile within the sheet. */
  off: number;
  dx: number;
  dy: number;
  flipX: boolean;
  flipY: boolean;
}

interface PoseFrame {
  slot: number;
  quads: readonly PoseQuad[];
}

interface PoseState {
  /** The engine's action id, 0x00-0x27. */
  action: number;
  /** False when the four facings share one animation, in which case only facing 0 is present. */
  perFacing: boolean;
  /** Facing index (0-3) to the slot numbers of its frames, in play order. */
  frames: Record<string, readonly number[]>;
}

interface PoseBounds {
  minX: number;
  minY: number;
  maxX: number;
  maxY: number;
}

interface PoseAtlas {
  note: string;
  sheetCols: number;
  tileBytes: number;
  rowStride: number;
  quadSize: number;
  /** Union of every frame's extent, so one canvas size fits every pose. */
  bounds: PoseBounds;
  frames: readonly PoseFrame[];
  states: readonly PoseState[];
}

export type { PoseQuad, PoseFrame, PoseState, PoseBounds, PoseAtlas };
