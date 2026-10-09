/* @layer shared-hud @kind types */
type Band = 'start' | 'center' | 'end';

interface BandPair { x: Band; y: Band }

export type { Band, BandPair };
