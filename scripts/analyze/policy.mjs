/**
 * @layer tooling-scripts
 * @kind config
 *
 * Per-kind policy (Strategy table). Baseline cap is 200 code lines; documented
 * variances live here. `max: null` = exempt from the line cap (still classified
 * and, where a linter applies, still linted). `linters` lists which adapters a
 * kind must satisfy.
 */
const BASELINE = 200;

const KIND_POLICY = {
  logic: { max: BASELINE, linters: ['eslint', 'tsc'] },
  component: { max: BASELINE, linters: ['eslint', 'tsc'] },
  hook: { max: BASELINE, linters: ['eslint', 'tsc'] },
  types: { max: BASELINE, linters: ['eslint', 'tsc'] },
  constants: { max: BASELINE, linters: ['eslint', 'tsc'] },
  barrel: { max: 80, linters: ['eslint', 'tsc'] },
  native: { max: BASELINE, linters: ['clang-format'] },        // our C (game-hooks, wasm-build)
  style: { max: 300, linters: ['stylelint'] },                 // CSS: rule groups run longer
  test: { max: 300, linters: ['eslint', 'tsc'] },              // fixtures + cases
  data: { max: null, linters: ['tsc'], mustLiveIn: ['/data/', '.data.'] },
  generated: { max: null, linters: [] },
  doc: { max: null, linters: ['markdownlint'] },
  config: { max: null, linters: [] },
  'config-data': { max: null, linters: [] },
  build: { max: null, linters: [] },
  asset: { max: null, linters: [] },
};

// Vendored = the upstream zelda3 decompilation (another project, not fully ours).
// Still classified + analyzed, but findings are downgraded to hints (never gate).
const isVendored = (rel) => rel.startsWith('core/zelda3/');

const capFor = (kind) => (KIND_POLICY[kind] ?? { max: BASELINE }).max;
const lintersFor = (kind) => (KIND_POLICY[kind] ?? { linters: [] }).linters ?? [];

export { KIND_POLICY, BASELINE, isVendored, capFor, lintersFor };
