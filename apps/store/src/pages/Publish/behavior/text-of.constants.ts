/* @layer store-site @kind constants */
import { DEFAULT_ITEM_COLOR } from '@rotp/hub-contracts';
import { DEFAULT_LICENSE } from '../Publish.constants';
import type { ListingText } from './useListingFields.type';

const EMPTY: ListingText = { name: '', summary: '', description: '', tags: [], license: DEFAULT_LICENSE, color: DEFAULT_ITEM_COLOR };

export { EMPTY };
