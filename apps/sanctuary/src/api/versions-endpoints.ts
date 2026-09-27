/* @layer sanctuary-site @kind logic */
/**
 * The version routes of one file: the three multipart steps of a new version, then
 * restore, download and delete of one version by its number.
 */
import type { BeginVersionBody } from '@shared/sanctuary/schemas/file-schemas';
import { sanctuaryApi } from './sanctuary-client';
import type { VersionBeginResponse, SignPartsResponse, FileResponse, DownloadResponse } from './types';

const beginVersion = (id: string, body: BeginVersionBody) =>
  sanctuaryApi.request<VersionBeginResponse>('fileVersionsBegin', { params: { id }, body });

const signVersionParts = (id: string, n: number, parts: number[]) =>
  sanctuaryApi.request<SignPartsResponse>('fileVersionsSignParts', { params: { id, n }, body: { parts } });

const completeVersion = (id: string, n: number, etags: string[]) =>
  sanctuaryApi.request<FileResponse>('fileVersionsComplete', { params: { id, n }, body: { etags } });

/** Moves the file's current version back to `n`; no bytes are copied. */
const restoreVersion = (id: string, n: number) =>
  sanctuaryApi.request<FileResponse>('fileVersionsRestore', { params: { id, n }, body: {} });

const downloadVersion = (id: string, n: number) =>
  sanctuaryApi.request<DownloadResponse>('fileVersionsDownload', { params: { id, n }, body: {} });

const deleteVersion = (id: string, n: number) => sanctuaryApi.request<FileResponse>('fileVersionsDelete', { params: { id, n } });

export { beginVersion, signVersionParts, completeVersion, restoreVersion, downloadVersion, deleteVersion };
