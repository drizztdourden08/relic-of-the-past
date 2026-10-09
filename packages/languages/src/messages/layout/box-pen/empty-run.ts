/* @layer shared-game @kind logic */
import type { Run } from './box-pen.type';

const emptyRun = (): Run => ({ glyphs: [], offsets: [], widthPx: 0 });

export { emptyRun };
