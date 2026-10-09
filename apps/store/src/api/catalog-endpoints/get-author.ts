/* @layer store-site @kind logic */
import type { AuthorResponse } from '@rotp/hub-contracts';
import { storeApi } from '../store-client';

const getAuthor = (userId: string) => storeApi.request<AuthorResponse>('authorsGet', { params: { userId } });

export { getAuthor };
