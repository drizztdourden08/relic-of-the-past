/* @layer tooling-scripts @kind config */
const BASELINE = 200;

const KIND_POLICY = {
  logic: { max: BASELINE },
  component: { max: BASELINE },
  hook: { max: BASELINE },
  types: { max: BASELINE },
  constants: { max: BASELINE },
  barrel: { max: 80 },
  native: { max: BASELINE },
  style: { max: 300 },
  test: { max: 300 },
  data: { max: null, mustLiveIn: ['/data/', '.data.'] },
  generated: { max: null },
  doc: { max: null },
  config: { max: null },
  'config-data': { max: null },
  build: { max: null },
  asset: { max: null },
};

const isVendored = (rel) => rel.startsWith('core/zelda3/');

const capFor = (kind) => (KIND_POLICY[kind] ?? { max: BASELINE }).max;

export { isVendored, capFor };
