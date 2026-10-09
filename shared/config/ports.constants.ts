/* @layer shared-config @kind constants */
import type { PortRole } from './ports.type';

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

const portFor = (role: PortRole, slot = 0): number => PORT_BASE + PORTS_PER_SLOT * slot + PORT_OFFSET[role];

export { ARCHIPELAGO_DEFAULT_PORT, PORT_BASE, PORT_OFFSET, PORTS_PER_SLOT, portFor };
export type { PortRole };
