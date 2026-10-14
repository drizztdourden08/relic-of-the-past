/* @layer renderer-components @kind constants */
import type { IconName } from '@drizztdourden08/tessera/primitives';

const EXTRACTION_META: Record<RomExtractionStatus, { icon: IconName | null; label: string }> = {
  ready: { icon: 'check', label: 'Assets extracted' },
  extracting: { icon: 'refresh-cw', label: 'Extracting...' },
  failed: { icon: 'x', label: 'Extraction failed' },
  idle: { icon: null, label: 'No assets' },
};

export { EXTRACTION_META };
