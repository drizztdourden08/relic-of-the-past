/* @layer tests @kind constants */
import { resolve } from 'path';
import type { Platform } from '@drizztdourden08/brock-core';

const SUB = resolve(__dirname, '../../../apps/desktop/src/views/HudLayoutEditor/sub-components');
const PLATFORM = { info: { os: 'windows' } } as unknown as Platform;

export { PLATFORM, SUB };
