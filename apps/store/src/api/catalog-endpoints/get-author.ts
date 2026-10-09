/* @layer store-site @kind logic */
import type { AuthorResponse } from '@shared/store/api-types';
import { storeApi } from '../store-client';

const getAuthor = (userId: string) => storeApi.request<AuthorResponse>('authorsGet', { params: { userId } });

export { getAuthor };
