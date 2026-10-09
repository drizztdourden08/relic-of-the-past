/* @layer renderer-components @kind logic */
import type { MsuLayer } from '@shared/types/msu-manifest';

const bodyLayer = (trackNum: number, files: string[]): MsuLayer => ({
  id: `track-${trackNum}`,
  name: `Track ${trackNum}`,
  files,
  mode: files.length > 1 ? { kind: 'loop', order: 'sequential' } : { kind: 'loop', order: 'single' },
  volume: 100,
});

export { bodyLayer };
