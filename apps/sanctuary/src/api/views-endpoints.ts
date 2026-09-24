/* @layer sanctuary-site @kind logic */
/** The saved-view routes: list one surface, put one view, delete one view. */
import type { SavedView, ViewSurface } from '@shared/sanctuary/types';
import type { PutViewBody } from '@shared/sanctuary/schemas/account-schemas';
import { request } from './client';
import type { ViewsListResponse } from './types';

const listViews = (surface: ViewSurface) => request<ViewsListResponse>('viewsList', { query: { surface } });

const putView = (id: string, body: PutViewBody) => request<SavedView>('viewsPut', { params: { id }, body });

const deleteView = (id: string) => request<{ ok: true }>('viewsDelete', { params: { id } });

export { listViews, putView, deleteView };
