/* @layer bridge-wasm @kind logic */
import { isCoreReady } from '../../core-ready';
import { cheatCategoryAllowed } from './cheat-category-allowed';

const cheatItemGrantAllowed = (): boolean => isCoreReady() && cheatCategoryAllowed('items');

export { cheatItemGrantAllowed };
