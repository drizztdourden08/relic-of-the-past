/* @layer website-site @kind constants */
const SWEEP_MIN = 6;

const SWEEP_MAX = 94;

const SWEEP_MS = 4200;

const SPLIT_REST = 50;

const STEP_PER_MS = (SWEEP_MAX - SWEEP_MIN) / SWEEP_MS;

const SPLIT_VAR = '--compare-split';

export { SPLIT_REST, SPLIT_VAR, STEP_PER_MS, SWEEP_MAX, SWEEP_MIN, SWEEP_MS };
