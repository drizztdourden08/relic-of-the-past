/* @layer sanctuary-site @kind logic */
import { sanctuaryApi } from '../sanctuary-client';
import type { OkResponse } from '../api-responses.type';

const deleteFile = (id: string) => sanctuaryApi.request<OkResponse>('filesDelete', { params: { id } });

export { deleteFile };
