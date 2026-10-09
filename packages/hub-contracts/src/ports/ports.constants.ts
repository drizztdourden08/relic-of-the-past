/* @layer shared-config @kind constants */
const PORT_BASE = 1991;
const PORTS_PER_SLOT = 10;

const PORT_OFFSET = {
  renderer: 0,
  catalogue: 1,
  site: 2,
  siteApi: 3,
  static: 4,
  mgbaTracer: 5,
} as const;

const ARCHIPELAGO_DEFAULT_PORT = 38281;

export { ARCHIPELAGO_DEFAULT_PORT, PORT_BASE, PORT_OFFSET, PORTS_PER_SLOT };
