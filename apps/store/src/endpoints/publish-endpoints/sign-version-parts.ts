/* @layer store-site @kind logic */
import type { SignPartsResponse } from '@rotp/hub-contracts';
import { storeApi } from '../store-client';

const signVersionParts = (id: string, n: number, parts: number[], partsDone?: number) =>
  storeApi.request<SignPartsResponse>('versionsSignParts', { params: { id, n }, body: { parts, partsDone } });

export { signVersionParts };
