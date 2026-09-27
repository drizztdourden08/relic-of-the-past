/* @layer shared-game @kind data */
import { recordsIn } from '../registry';
import type { ScreenRecord } from '../types';

// Every record file in the tree, whatever depth it sits at: world, then overworld,
// interiors or a dungeon's floor.
const files = import.meta.glob('../records/screens/**/*.ts', { eager: true });

const ALL_SCREENS: ScreenRecord[] = recordsIn<ScreenRecord>(files);

export { ALL_SCREENS };
