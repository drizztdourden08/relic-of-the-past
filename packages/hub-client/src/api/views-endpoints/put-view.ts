/* @layer site-kit @kind logic */
import type { SavedView, PutViewBody } from '@rotp/hub-contracts';
import { hubApi } from '../hub-client';

const putView = (id: string, body: PutViewBody) => hubApi.request<SavedView>('viewsPut', { params: { id }, body });

export { putView };
