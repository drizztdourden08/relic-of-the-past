/* @layer shared-game @kind types */
/**
 * The intro's clock as the core reports it each frame (core/game-hooks/title_mirror.c), and the
 * phase the host draws for it. Every field is a counter the game itself keeps; the host never counts
 * frames of its own for the choreography.
 */

type TitlePhase = 'boot' | 'triforce' | 'logo' | 'sword' | 'scene' | 'idle' | 'gone';

interface TitlePiece {
  x: number;
  y: number;
}

interface TitleFrame {
  module: number;
  submodule: number;
  subsub: number;
  step: number;
  stepTimer: number;
  frameCtr: number;
  /** The screen brightness the boot fades out and the story fade brings down again, 0-15. */
  inidisp: number;
  polyA: number;
  polyB: number;
  polyDistance: number;
  /** The falling sword's base, at rest 30. */
  swordY: number;
  /** 0 none, 1 the sparkle on the hilt, 2 the glint running down the blade. */
  sparklePhase: number;
  sparkleIndex: number;
  sparkleRun: number;
  /** Frames of the clang flash left, lit on three frames of every four. */
  flashLeft: number;
  /** The palette fade countdown, 31 to 0 every other frame, for the logo and then the scene. */
  fade: number;
  /** Where the three triangle sprites are, top-left of each 64x64 piece. */
  pieces: readonly TitlePiece[];
  attractState: number;
}

type SwordTier = 'fighter' | 'master' | 'tempered' | 'golden';
type TitleWorld = 'light' | 'dark';

interface TitleProgress {
  tier: SwordTier;
  world: TitleWorld;
  /** The save file the pick came from, or null with no valid file. */
  fromSlot: number | null;
}

export type { SwordTier, TitleFrame, TitlePhase, TitlePiece, TitleProgress, TitleWorld };
