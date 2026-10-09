/* @layer site-kit @kind logic */
import type { SavedView } from '@rotp/hub-contracts';
import type { PutViewBody } from '@rotp/hub-contracts';
import { hubApi } from '../hub-client';

const putView = (id: string, body: PutViewBody) => hubApi.request<SavedView>('viewsPut', { params: { id }, body });

export { putView };
