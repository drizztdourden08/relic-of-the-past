/* @layer site-kit @kind logic */
import { hubApi } from '../hub-client';
import type { ViewsListResponse } from '../hub-responses.type';

const listViews = (surface: string) => hubApi.request<ViewsListResponse>('viewsList', { query: { surface } });

export { listViews };
