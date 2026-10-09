/* @layer tests @kind helper */
import { existsSync } from 'fs';
import { MAIN_JS } from './hud-layout-options.constants';

const built = (): boolean => existsSync(MAIN_JS);

export { built };
