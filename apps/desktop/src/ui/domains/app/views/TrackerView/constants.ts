/* @layer renderer-components @kind constants */
const STORAGE_KEY = 'tracker-layout';

const MODE_OPTIONS = [
  { value: 'left' as const, label: '◧' },
  { value: 'right' as const, label: '◨' },
  { value: 'float' as const, label: '⊡' },
];

export { STORAGE_KEY, MODE_OPTIONS };
