/* @layer tests @kind constants */
import { resolve } from 'path';
import { REPO_ROOT } from '../../repo-root';

const EDITOR = resolve(REPO_ROOT, 'apps/desktop/src/views/HudLayoutEditor');
const VIEW = { w: 398, h: 224 };

export { EDITOR, VIEW };
