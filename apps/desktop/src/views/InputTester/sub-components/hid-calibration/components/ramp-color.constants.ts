/* @layer renderer-components @kind constants */
const RAMP: { at: number; rgb: [number, number, number] }[] = [
  { at: 0, rgb: [74, 222, 128] },
  { at: 0.5, rgb: [251, 191, 36] },
  { at: 0.75, rgb: [251, 146, 60] },
  { at: 1, rgb: [248, 113, 113] },
];

const DEFAULT_CHANGE_SPAN = 128;

export { RAMP, DEFAULT_CHANGE_SPAN };
