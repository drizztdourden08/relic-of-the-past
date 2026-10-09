/* @layer store-site @kind logic */
import type { PackLinkResponse } from '@shared/store/api-types';
import { storeApi } from '../store-client';

const itemPack = (id: string) => storeApi.request<PackLinkResponse>('itemsPack', { params: { id } });

export { itemPack };
