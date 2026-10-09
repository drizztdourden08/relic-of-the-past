/* @layer renderer-lib @kind logic */
import { TITLE_MODULES } from './title-reset.constants';

const isTitleModule = (module: number): boolean => TITLE_MODULES.has(module);

export { isTitleModule };
