/* @layer sanctuary-site @kind logic */
import { sanctuaryApi } from '../sanctuary-client';
import type { SignPartsResponse } from '../api-responses.type';

const signVersionParts = (id: string, n: number, parts: number[], partsDone?: number) =>
  sanctuaryApi.request<SignPartsResponse>('fileVersionsSignParts', { params: { id, n }, body: { parts, partsDone } });

export { signVersionParts };
