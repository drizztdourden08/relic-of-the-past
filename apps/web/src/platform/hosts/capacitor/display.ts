/* @layer renderer-other @kind logic */
/**
 * Capacitor display adapter.
 *
 * Android does expose the refresh rate and the supported modes natively, but reaching them
 * needs a plugin on the Java side. Until that exists this reports nothing, and the renderer's
 * frame-timing measurement supplies the rate — which is enough for the advisory, since a
 * measured rate is exactly what the pacing arithmetic cares about.
 */
import type { DisplayPort } from '@shared/platform';

const createCapacitorDisplay = (): DisplayPort => ({
  getRefreshRate: async () => ({ reportedHz: null, measuredHz: null, modes: [] }),
});

export { createCapacitorDisplay };
