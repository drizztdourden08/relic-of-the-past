/* @layer sanctuary-site @kind logic */
import { sanctuaryApi } from '../sanctuary-client';
import type { OkResponse } from '../api-responses.type';

const deleteReport = (id: string) => sanctuaryApi.request<OkResponse>('reportsDelete', { params: { id } });

export { deleteReport };
