/* @layer renderer-hud @kind constants */
const SWEEP_SECONDS = 1.6;
const REST_SECONDS = { min: 4, max: 9 } as const;
const FIRST_SWEEP_SECONDS = { min: 1.5, max: 3 } as const;
const STRENGTH = { min: 0.45, max: 1 } as const;
const SWEEP_SEED_SALT = 0x5ee9;
const STRIPE_SLANT_PX = 28;
const HALO_W = 14;
const CORE_W = 4;
const HALO_ALPHA = 0.45;
const CORE_ALPHA = 0.85;
const DWELL_AT = 0.33;
const DWELL_WIDTH = 0.2;
const DWELL_SPEED = 0.35;
const CURVE_STEPS = 128;

export {
  CORE_ALPHA, CORE_W, CURVE_STEPS, DWELL_AT, DWELL_SPEED, DWELL_WIDTH, FIRST_SWEEP_SECONDS, HALO_ALPHA, HALO_W, REST_SECONDS,
  STRENGTH, STRIPE_SLANT_PX, SWEEP_SECONDS, SWEEP_SEED_SALT,
};
