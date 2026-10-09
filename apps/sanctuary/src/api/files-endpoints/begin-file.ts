/* @layer sanctuary-site @kind logic */
import type { CreateFileBody } from '@shared/sanctuary/schemas/file-schemas';
import { sanctuaryApi } from '../sanctuary-client';
import type { FileBeginResponse } from '../api-responses.type';

const beginFile = (body: CreateFileBody) => sanctuaryApi.request<FileBeginResponse>('filesCreate', { body });

export { beginFile };
