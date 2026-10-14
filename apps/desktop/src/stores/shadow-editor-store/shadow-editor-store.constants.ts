/* @layer renderer-stores @kind constants */
const UNDO_DEPTH = 20;

const DEFAULT_HEIGHT_LEVELS = [
  { label: 'Low', value: 0.25 },
  { label: 'Mid', value: 0.5 },
  { label: 'High', value: 0.75 },
  { label: 'Wall', value: 1.0 },
];

export { DEFAULT_HEIGHT_LEVELS, UNDO_DEPTH };
