/* @layer tests @kind constants */
import { resolve } from 'path';
import type { Platform } from '@drizztdourden08/brock-core';
import { REPO_ROOT } from '../../repo-root';

const EDITOR = resolve(REPO_ROOT, 'apps/desktop/src/views/HudLayoutEditor');
const PLATFORM = { info: { os: 'windows' } } as unknown as Platform;
const VIEW = { w: 398, h: 224 };

export { EDITOR, PLATFORM, VIEW };
