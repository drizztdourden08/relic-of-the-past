/* @layer sanctuary-site @kind logic */
/** The file routes: list, the three multipart steps, download, patch and delete. */
import type { CreateFileBody, PatchFileBody } from '@shared/sanctuary/schemas/file-schemas';
import { request } from './client';
import type {
  FilesListResponse,
  FileBeginResponse,
  SignPartsResponse,
  FileResponse,
  DownloadResponse,
} from './types';

/** Every ready file, one page. The rail counts and the type filter run in the browser. */
const listFiles = () => request<FilesListResponse>('filesList');

const beginFile = (body: CreateFileBody) => request<FileBeginResponse>('filesCreate', { body });

const signParts = (id: string, parts: number[]) =>
  request<SignPartsResponse>('filesSignParts', { params: { id }, body: { parts } });

const completeFile = (id: string, etags: string[]) =>
  request<FileResponse>('filesComplete', { params: { id }, body: { etags } });

const downloadFile = (id: string) => request<DownloadResponse>('filesDownload', { params: { id } });

const patchFile = (id: string, patch: PatchFileBody) =>
  request<FileResponse>('filesPatch', { params: { id }, body: patch });

const deleteFile = (id: string) => request<{ ok: true }>('filesDelete', { params: { id } });

export { listFiles, beginFile, signParts, completeFile, downloadFile, patchFile, deleteFile };
