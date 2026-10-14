/* @layer renderer-appshell @kind logic */
import type { NavDumpParts } from './nav-dump.type';

const dumpDetection = (detection: NavDumpParts['detection']) => (detection ? {
  screenId: detection.screen.id,
  screenName: detection.screen.name,
  method: detection.method,
  hasVariant: Boolean(detection.screen.variant),
  variantKey: detection.screen.variant?.key ?? null,
} : null);

export { dumpDetection };
