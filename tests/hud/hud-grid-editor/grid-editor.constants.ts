/* @layer tests @kind constants */
import { resolve } from 'path';
import type { Platform } from '../../../shared/platform';

const EDITOR = resolve(__dirname, '../../../apps/desktop/src/ui/domains/app/views/HudLayoutEditor');
const PLATFORM = { info: { os: 'windows' } } as unknown as Platform;
const VIEW = { w: 398, h: 224 };

export { EDITOR, PLATFORM, VIEW };
