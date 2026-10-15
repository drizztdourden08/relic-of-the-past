/* @layer shared-game @kind types */
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
  inidisp: number;
  polyA: number;
  polyB: number;
  polyDistance: number;
  swordY: number;
  sparklePhase: number;
  sparkleIndex: number;
  sparkleRun: number;
  flashLeft: number;
  fade: number;
  pieces: readonly TitlePiece[];
  attractState: number;
}

type SwordTier = 'fighter' | 'master' | 'tempered' | 'golden';
type TitleWorld = 'light' | 'dark';

interface TitleProgress {
  tier: SwordTier;
  world: TitleWorld;
  fromSlot: number | null;
}

export type { SwordTier, TitleFrame, TitlePhase, TitlePiece, TitleProgress };
