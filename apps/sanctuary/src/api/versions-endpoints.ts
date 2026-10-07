/* @layer sanctuary-site @kind logic */
/**
 * The version routes of one file: the multipart steps of a new version (with the parts
 * already up, for a resumed upload), then restore, download and delete of one version by
 * its number.
 */
import type { BeginVersionBody } from '@shared/sanctuary/schemas/file-schemas';
import { sanctuaryApi } from './sanctuary-client';
import type { VersionBeginResponse, SignPartsResponse, UploadedPartsResponse, FileResponse, DownloadResponse } from './types';

const beginVersion = (id: string, body: BeginVersionBody) =>
  sanctuaryApi.request<VersionBeginResponse>('fileVersionsBegin', { params: { id }, body });

/** `partsDone` is how many parts are already up, which the version keeps. */
const signVersionParts = (id: string, n: number, parts: number[], partsDone?: number) =>
  sanctuaryApi.request<SignPartsResponse>('fileVersionsSignParts', { params: { id, n }, body: { parts, partsDone } });

const versionParts = (id: string, n: number) =>
  sanctuaryApi.request<UploadedPartsResponse>('fileVersionsParts', { params: { id, n } });

const completeVersion = (id: string, n: number, etags: string[]) =>
  sanctuaryApi.request<FileResponse>('fileVersionsComplete', { params: { id, n }, body: { etags } });

/** Moves the file's current version back to `n`; no bytes are copied. */
const restoreVersion = (id: string, n: number) =>
  sanctuaryApi.request<FileResponse>('fileVersionsRestore', { params: { id, n }, body: {} });

const downloadVersion = (id: string, n: number) =>
  sanctuaryApi.request<DownloadResponse>('fileVersionsDownload', { params: { id, n }, body: {} });

const deleteVersion = (id: string, n: number) => sanctuaryApi.request<FileResponse>('fileVersionsDelete', { params: { id, n } });

export { beginVersion, signVersionParts, versionParts, completeVersion, restoreVersion, downloadVersion, deleteVersion };
