/* @layer store-site @kind logic */
import type { SignPartsResponse } from '@shared/store/api-types';
import { storeApi } from '../store-client';

const signVersionParts = (id: string, n: number, parts: number[], partsDone?: number) =>
  storeApi.request<SignPartsResponse>('versionsSignParts', { params: { id, n }, body: { parts, partsDone } });

export { signVersionParts };
