/* @layer site-kit @kind logic */
import type { SavedView } from '@shared/hub/types';
import type { PutViewBody } from '@shared/hub/schemas/account-schemas';
import { hubApi } from '../hub-client';

const putView = (id: string, body: PutViewBody) => hubApi.request<SavedView>('viewsPut', { params: { id }, body });

export { putView };
