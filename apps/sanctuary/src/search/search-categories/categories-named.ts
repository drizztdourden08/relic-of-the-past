/* @layer sanctuary-site @kind logic */
import type { FileType } from '@rotp/hub-contracts';
import { SEARCH_CATEGORIES } from './search-categories.constants';
import type { CategoryRights, SearchCategory } from './search-categories.type';

const isAllowed = (category: SearchCategory, rights: CategoryRights) =>
  (category.surface === 'reports' ? rights.reports : rights.types.includes(category.scope as FileType));

const categoriesNamed = (query: string, rights: CategoryRights): SearchCategory[] =>
  SEARCH_CATEGORIES.filter((category) => isAllowed(category, rights) && category.label.toLowerCase().includes(query));

export { categoriesNamed };
