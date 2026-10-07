/* @layer sanctuary-site @kind logic */
/** The file routes: list, the three multipart steps, download, preview, patch and delete. */
import type { CreateFileBody, PatchFileBody } from '@shared/sanctuary/schemas/file-schemas';
import { sanctuaryApi } from './sanctuary-client';
import type {
  FilesListResponse,
  FileBeginResponse,
  SignPartsResponse,
  UploadedPartsResponse,
  FileResponse,
  DownloadResponse,
  PreviewResponse,
} from './types';

/** Every ready file, one page. The rail counts and the type filter run in the browser. */
const listFiles = () => sanctuaryApi.request<FilesListResponse>('filesList');

const beginFile = (body: CreateFileBody) => sanctuaryApi.request<FileBeginResponse>('filesCreate', { body });

/** `partsDone` is how many parts are already up, which the record keeps. */
const signParts = (id: string, parts: number[], partsDone?: number) =>
  sanctuaryApi.request<SignPartsResponse>('filesSignParts', { params: { id }, body: { parts, partsDone } });

/** The parts of a first upload already in the bucket, for a resumed upload. */
const fileParts = (id: string) => sanctuaryApi.request<UploadedPartsResponse>('filesParts', { params: { id } });

const completeFile = (id: string, etags: string[]) =>
  sanctuaryApi.request<FileResponse>('filesComplete', { params: { id }, body: { etags } });

const downloadFile = (id: string) => sanctuaryApi.request<DownloadResponse>('filesDownload', { params: { id } });

/** An inline link to version `v`, or to the current version when `v` is left out. */
const previewFile = (id: string, v?: number) =>
  sanctuaryApi.request<PreviewResponse>('filesPreview', { params: { id }, query: { v } });

const patchFile = (id: string, patch: PatchFileBody) =>
  sanctuaryApi.request<FileResponse>('filesPatch', { params: { id }, body: patch });

const deleteFile = (id: string) => sanctuaryApi.request<{ ok: true }>('filesDelete', { params: { id } });

export { listFiles, beginFile, signParts, fileParts, completeFile, downloadFile, previewFile, patchFile, deleteFile };
