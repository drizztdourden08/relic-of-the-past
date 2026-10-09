/* @layer tooling-scripts @kind config */
const BASELINE = 200;

const KIND_POLICY = {
  logic: { max: BASELINE, linters: ['eslint', 'tsc'] },
  component: { max: BASELINE, linters: ['eslint', 'tsc'] },
  hook: { max: BASELINE, linters: ['eslint', 'tsc'] },
  types: { max: BASELINE, linters: ['eslint', 'tsc'] },
  constants: { max: BASELINE, linters: ['eslint', 'tsc'] },
  barrel: { max: 80, linters: ['eslint', 'tsc'] },
  native: { max: BASELINE, linters: ['clang-format'] },
  style: { max: 300, linters: ['stylelint'] },
  test: { max: 300, linters: ['eslint', 'tsc'] },
  data: { max: null, linters: ['tsc'], mustLiveIn: ['/data/', '.data.'] },
  generated: { max: null, linters: [] },
  doc: { max: null, linters: ['markdownlint'] },
  config: { max: null, linters: [] },
  'config-data': { max: null, linters: [] },
  build: { max: null, linters: [] },
  asset: { max: null, linters: [] },
};

const isVendored = (rel) => rel.startsWith('core/zelda3/');

const capFor = (kind) => (KIND_POLICY[kind] ?? { max: BASELINE }).max;
const lintersFor = (kind) => (KIND_POLICY[kind] ?? { linters: [] }).linters ?? [];

export { KIND_POLICY, BASELINE, isVendored, capFor, lintersFor };
