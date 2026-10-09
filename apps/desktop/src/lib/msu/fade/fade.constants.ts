/* @layer renderer-lib @kind constants */
const MUSIC_FADE_OUT = 0xf1;
const MUSIC_DUCK = 0xf2;
const MUSIC_FULL_VOLUME = 0xf3;

const TRANSITIONS: Record<number, { target: number; step: number }> = {
  [MUSIC_FADE_OUT]: { target: 0, step: 7 },
  [MUSIC_DUCK]: { target: 64, step: 3 },
  [MUSIC_FULL_VOLUME]: { target: 255, step: 3 },
};

const FULL_STEP = 24;
const FRAMES_PER_SECOND = 60;
const MIN_RAMP_SECONDS = 0.001;

export { MUSIC_FADE_OUT, MUSIC_DUCK, MUSIC_FULL_VOLUME, TRANSITIONS, FULL_STEP, FRAMES_PER_SECOND, MIN_RAMP_SECONDS };
