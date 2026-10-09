/* @layer tests @kind constants */
import { resolve } from 'path';
import type { Platform } from '../../../shared/platform';

const ED = resolve(__dirname, '../../../apps/desktop/src/ui/domains/app/views/HudLayoutEditor');
const VIEW = { w: 400, h: 200 };
const GUIDE = '#12ab34';
const PLATFORM = { info: { os: 'windows' } } as unknown as Platform;

export { ED, GUIDE, PLATFORM, VIEW };
