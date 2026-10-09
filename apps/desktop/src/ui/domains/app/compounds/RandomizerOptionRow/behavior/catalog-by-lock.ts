/* @layer renderer-components @kind logic */
import { OPTION_GROUPS, optionCatalog } from '@shared/randomizer/world/options.data';
import type { CatalogByLock } from '../RandomizerOptionRow.type';
import { partitionCatalogByLock } from './partitionCatalogByLock';

const catalogByLock: CatalogByLock = partitionCatalogByLock(optionCatalog, OPTION_GROUPS);

export { catalogByLock };
