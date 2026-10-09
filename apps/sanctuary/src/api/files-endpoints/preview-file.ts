/* @layer sanctuary-site @kind logic */
import { sanctuaryApi } from '../sanctuary-client';
import type { PreviewResponse } from '../api-responses.type';

const previewFile = (id: string, v?: number) =>
  sanctuaryApi.request<PreviewResponse>('filesPreview', { params: { id }, query: { v } });

export { previewFile };
