/* @layer tests @kind constants */
import { resolve } from 'path';
import type { Platform } from '../../../shared/platform';

const SUB = resolve(__dirname, '../../../apps/web/src/ui/domains/app/views/HudLayoutEditor/sub-components');
const PLATFORM = { info: { os: 'windows' } } as unknown as Platform;

export { PLATFORM, SUB };
