/* @layer shared-game @kind constants */
import { passagesBySource } from './passages-by-source';
import type { ItemRule } from '../world.type';

const ALLOW_ANY_ITEM: ItemRule = () => true;

const PASSAGES_BY_SOURCE = passagesBySource();

export { ALLOW_ANY_ITEM, PASSAGES_BY_SOURCE };
