/* @layer sanctuary-site @kind logic */
import { sanctuaryApi } from '../sanctuary-client';
import type { FilesListResponse } from '../api-responses.type';

const listFiles = () => sanctuaryApi.request<FilesListResponse>('filesList');

export { listFiles };
