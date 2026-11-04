/* @layer renderer-components @kind constants */
const SCOPE_OPTIONS = [
  { value: 'changed', label: 'Changed' },
  { value: 'all', label: 'All' },
];

const SCOPE_TITLES = {
  changed: 'Options changed from the default',
  all: 'Every option',
} as const;

export { SCOPE_OPTIONS, SCOPE_TITLES };
