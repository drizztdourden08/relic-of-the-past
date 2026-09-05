/* @layer shared-game @kind data */
import { collectRecords } from '../collect-records';
import type { ScreenRecord } from '../types';

// One entry per world. Empty without vault access (see collect-records.ts).
const worlds = import.meta.glob('../records/screens/*/index.ts', { eager: true });

const ALL_SCREENS: ScreenRecord[] = collectRecords<ScreenRecord>(worlds);

export { ALL_SCREENS };
