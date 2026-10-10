/* @layer tests @kind constants */
import { resolve } from 'path';
import type { Platform } from '@drizztdourden08/brock-core';
import { REPO_ROOT } from '../../repo-root';

const ED = resolve(REPO_ROOT, 'apps/desktop/src/views/HudLayoutEditor');
const VIEW = { w: 400, h: 200 };
const GUIDE = '#12ab34';
const PLATFORM = { info: { os: 'windows' } } as unknown as Platform;

export { ED, GUIDE, PLATFORM, VIEW };
