/* @layer renderer-components @kind constants */
import type { PortalLayer } from './Portal.type';

const LAYERS: Record<PortalLayer, number> = {
  overlay: 100,
  modal: 200,
  popover: 250,
  toast: 300,
  tooltip: 400,
} as const;

export { LAYERS };
