/* @layer renderer-components @kind constants */
import type { GlyphMetrics } from '@rotp/languages';

const PLACEHOLDER = 'Type the line\u2026';

const EMPTY_METRICS: GlyphMetrics = { widths: new Uint8Array(0), alphabet: [] };

export { PLACEHOLDER, EMPTY_METRICS };
