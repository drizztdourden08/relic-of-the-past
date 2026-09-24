/* @layer shared-game @kind logic */
/**
 * Which phase of the title the core is in, and how far its fades are, read straight from the
 * counters so a skip or a state load lands on the right picture (Module00_Intro, ending.c).
 */
import type { TitleFrame, TitlePhase } from './title-frame.type';

const MODULE_INTRO = 0;
const MODULE_ATTRACT = 20;
/** The palette fade runs 31 steps; the logo layer turns on when 13 are left. */
const FADE_STEPS = 31;
const LOGO_LAYER_ON_AT = 13;

const phaseOf = (f: TitleFrame): TitlePhase => {
  if (f.module === MODULE_ATTRACT) return f.attractState === 0 ? 'idle' : 'gone';
  if (f.module !== MODULE_INTRO) return 'gone';
  if (f.submodule <= 2) return 'boot';
  if (f.submodule <= 4) return 'triforce';
  if (f.submodule === 5) return 'logo';
  if (f.submodule === 6) return 'sword';
  if (f.submodule === 7 && f.fade > 0) return 'scene';
  return 'idle';
};

/** The logo fades in during submodule 5, from the step its layer turns on; solid from then on. */
const logoAlpha = (f: TitleFrame): number => {
  if (f.module !== MODULE_INTRO) return 1;
  if (f.submodule < 5) return 0;
  if (f.submodule > 5) return 1;
  return f.fade > LOGO_LAYER_ON_AT ? 0 : (FADE_STEPS - f.fade) / FADE_STEPS;
};

/** The lake and castle fade in during submodule 7; solid from then on. */
const sceneAlpha = (f: TitleFrame): number => {
  if (f.module !== MODULE_INTRO) return 1;
  if (f.submodule < 7) return 0;
  if (f.submodule > 7) return 1;
  return (FADE_STEPS - f.fade) / FADE_STEPS;
};

/** The sword shows from its drop on. */
const swordShown = (f: TitleFrame): boolean => f.module !== MODULE_INTRO || f.submodule >= 6;

/** The triangles show from the moment the poly thread starts. */
const triforceShown = (f: TitleFrame): boolean => f.module !== MODULE_INTRO || f.submodule >= 3;

/** The clang flash lights three frames of every four while it runs. */
const flashOn = (f: TitleFrame): boolean => f.flashLeft > 0 && (f.flashLeft & 3) !== 0;

/** Screen brightness, 0-1, from the register the boot and the story fade drive. */
const brightness = (f: TitleFrame): number => Math.min(15, f.inidisp & 15) / 15;

export { brightness, flashOn, logoAlpha, phaseOf, sceneAlpha, swordShown, triforceShown };
