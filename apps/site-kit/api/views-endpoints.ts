/* @layer site-kit @kind logic */
/** The saved-view routes: list one surface, put one view, delete one view. */
import type { SavedView } from '@shared/hub/types';
import type { PutViewBody } from '@shared/hub/schemas/account-schemas';
import { hubApi } from './hub-client';
import type { ViewsListResponse } from './hub-responses.type';

const listViews = (surface: string) => hubApi.request<ViewsListResponse>('viewsList', { query: { surface } });

const putView = (id: string, body: PutViewBody) => hubApi.request<SavedView>('viewsPut', { params: { id }, body });

const deleteView = (id: string) => hubApi.request<{ ok: true }>('viewsDelete', { params: { id } });

export { listViews, putView, deleteView };
