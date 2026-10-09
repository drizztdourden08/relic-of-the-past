/* @layer shared-config @kind types */
import type { PORT_OFFSET } from './ports.constants';

type PortRole = keyof typeof PORT_OFFSET;

export type { PortRole };
