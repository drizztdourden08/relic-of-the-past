/* @layer renderer-components @kind logic */
import { OPTION_GROUPS, optionCatalog } from '@rotp/randomizer';
import type { CatalogByLock } from '../RandomizerOptionRow.type';
import { partitionCatalogByLock } from './partitionCatalogByLock';

const catalogByLock: CatalogByLock = partitionCatalogByLock(optionCatalog, OPTION_GROUPS);

export { catalogByLock };
