/* @layer shared-game @kind constants */
import { recordsIn } from '../registry';
import type { ScreenRecord } from '../types';

const files = import.meta.glob('../records/screens/**/*.ts', { eager: true });

const ALL_SCREENS: ScreenRecord[] = recordsIn<ScreenRecord>(files);

export { ALL_SCREENS };
