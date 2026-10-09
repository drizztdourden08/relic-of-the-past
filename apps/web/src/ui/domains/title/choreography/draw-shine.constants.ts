/* @layer renderer-hud @kind constants */
const SPARKLE_RADIUS_PER_STEP: readonly number[] = [1, 2, 4, 6, 4, 2];
const SPARKLE_DIAGONALS_FROM_RADIUS = 6;
const STEP_SECONDS = { min: 0.05, max: 0.09 } as const;
const PAUSE_SECONDS = { min: 0.12, max: 0.9 } as const;
const SHINE_SEED_SALT = 0x51a5;

export { PAUSE_SECONDS, SHINE_SEED_SALT, SPARKLE_DIAGONALS_FROM_RADIUS, SPARKLE_RADIUS_PER_STEP, STEP_SECONDS };
