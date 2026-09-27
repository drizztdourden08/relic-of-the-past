/* @layer store-site @kind logic */
/**
 * What an author calls: create a draft, send its pictures and listing, the multipart steps
 * of a version, withdrawing one, and the list of everything they published. The bodies are
 * the shared schemas' types, so what the site sends is what store-api parses.
 */
import type {
  ItemChangeResponse,
  ItemCreateResponse,
  MediaUploadResponse,
  PublicationsResponse,
  SignPartsResponse,
  VersionBeginResponse,
  VersionCompleteResponse,
} from '@shared/store/api-types';
import type { ItemCreateBody, ListingPatchBody, MediaUploadBody, VersionBeginBody } from '@shared/store/schemas';
import { storeApi } from './store-client';

const createItem = (body: ItemCreateBody) => storeApi.request<ItemCreateResponse>('itemsCreate', { body });

const beginMedia = (id: string, body: MediaUploadBody) =>
  storeApi.request<MediaUploadResponse>('itemsMedia', { params: { id }, body });

/** Answers with the item as it now stands; on a published item the edit waits in listingEdits. */
const submitListing = (id: string, body: ListingPatchBody) =>
  storeApi.request<ItemChangeResponse>('itemsListing', { params: { id }, body });

const beginVersion = (id: string, body: VersionBeginBody) =>
  storeApi.request<VersionBeginResponse>('versionsBegin', { params: { id }, body });

const signVersionParts = (id: string, n: number, parts: number[]) =>
  storeApi.request<SignPartsResponse>('versionsSignParts', { params: { id, n }, body: { parts } });

const completeVersion = (id: string, n: number, etags: string[]) =>
  storeApi.request<VersionCompleteResponse>('versionsComplete', { params: { id, n }, body: { etags } });

const abortVersion = (id: string, n: number) =>
  storeApi.request<ItemChangeResponse>('versionsAbort', { params: { id, n }, body: {} });

const withdrawVersion = (id: string, n: number) =>
  storeApi.request<ItemChangeResponse>('versionsWithdraw', { params: { id, n }, body: {} });

const listPublications = () => storeApi.request<PublicationsResponse>('myPublications');

export {
  createItem,
  beginMedia,
  submitListing,
  beginVersion,
  signVersionParts,
  completeVersion,
  abortVersion,
  withdrawVersion,
  listPublications,
};
