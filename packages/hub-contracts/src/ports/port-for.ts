/* @layer shared-config @kind logic */
import type { PortRole } from './ports.type';
import { PORT_BASE, PORT_OFFSET, PORTS_PER_SLOT } from './ports.constants';

const portFor = (role: PortRole, slot = 0): number => PORT_BASE + PORTS_PER_SLOT * slot + PORT_OFFSET[role];

export { portFor };
