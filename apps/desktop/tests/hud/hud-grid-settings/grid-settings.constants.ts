/* @layer tests @kind constants */
import { resolve } from 'path';
import type { Platform } from '@drizztdourden08/brock-core';
import { REPO_ROOT } from '../../repo-root';

const SUB = resolve(REPO_ROOT, 'apps/desktop/src/views/HudLayoutEditor/sub-components');
const PLATFORM = { info: { os: 'windows' } } as unknown as Platform;

export { PLATFORM, SUB };
