/* @layer renderer-lib @kind logic */
import { catalogApi } from '@drizztdourden08/brock-catalog/renderer';
import type { CatalogResult } from '@drizztdourden08/brock-catalog/renderer';
import type { HomeResponse, ItemResponse, ItemCardView } from '@rotp/hub-contracts';
import { NO_CATALOG } from './hookshop-reads.constants';

const hookshopReads = {
  home: async (): Promise<CatalogResult<HomeResponse>> => {
    const api = catalogApi();
    return api ? (await api.home()) as CatalogResult<HomeResponse> : NO_CATALOG;
  },
  items: async (): Promise<CatalogResult<ItemCardView[]>> => {
    const api = catalogApi();
    return api ? (await api.list()) as CatalogResult<ItemCardView[]> : NO_CATALOG;
  },
  item: async (itemId: string): Promise<CatalogResult<ItemResponse>> => {
    const api = catalogApi();
    return api ? (await api.item(itemId)) as CatalogResult<ItemResponse> : NO_CATALOG;
  },
};

export { hookshopReads };
