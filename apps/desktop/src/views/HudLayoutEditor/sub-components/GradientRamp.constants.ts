/* @layer renderer-components @kind constants */
const NUDGE_FINE = 0.01;
const NUDGE_COARSE = 0.1;

const NUDGE_KEYS: Readonly<Record<string, number | undefined>> = { ArrowRight: 1, ArrowLeft: -1 };

export { NUDGE_COARSE, NUDGE_FINE, NUDGE_KEYS };
