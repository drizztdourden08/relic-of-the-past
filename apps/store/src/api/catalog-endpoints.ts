/* @layer store-site @kind logic */
/**
 * What every player calls: the home page, the catalogue a page at a time, one item, an
 * author, a download grant, and their own stars on an item.
 */
import type { Stars } from '@shared/store/rating-types';
import type {
  AuthorResponse,
  DownloadResponse,
  HomeResponse,
  ItemResponse,
  ItemsListResponse,
  RatingResponse,
} from '@shared/store/api-types';
import { storeApi } from './store-client';
import type { DownloadBody } from '@shared/store/schemas';

const getHome = () => storeApi.request<HomeResponse>('home');

const listItems = (cursor: string | null) =>
  storeApi.request<ItemsListResponse>('itemsList', { query: { cursor: cursor ?? undefined } });

const getItem = (id: string) => storeApi.request<ItemResponse>('itemsGet', { params: { id } });

const getAuthor = (userId: string) => storeApi.request<AuthorResponse>('authorsGet', { params: { userId } });

const requestDownload = (id: string, body: DownloadBody = {}) =>
  storeApi.request<DownloadResponse>('download', { params: { id }, body });

const rateItem = (id: string, stars: Stars) =>
  storeApi.request<RatingResponse>('ratingPut', { params: { id }, body: { stars } });

const unrateItem = (id: string) => storeApi.request<RatingResponse>('ratingDelete', { params: { id } });

export { getHome, listItems, getItem, getAuthor, requestDownload, rateItem, unrateItem };
