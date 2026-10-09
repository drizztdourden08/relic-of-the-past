/* @layer shared-game @kind constants */
import type { BorderDir } from './border-bundles.type';

const BORDER_DIRS: readonly BorderDir[] = ['n', 's', 'e', 'w'];

const OPPOSITE_DIR: Record<BorderDir, BorderDir> = { n: 's', s: 'n', e: 'w', w: 'e' };

export { BORDER_DIRS, OPPOSITE_DIR };
