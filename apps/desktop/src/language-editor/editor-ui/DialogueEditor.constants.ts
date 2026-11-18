/* @layer renderer-components @kind constants */
import type { GlyphMetrics } from '@rotp/languages';

const EMPTY_METRICS: GlyphMetrics = { widths: new Uint8Array(0), alphabet: [] };

export { EMPTY_METRICS };
