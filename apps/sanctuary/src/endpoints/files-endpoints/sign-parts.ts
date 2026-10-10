/* @layer sanctuary-site @kind logic */
import { sanctuaryApi } from '../sanctuary-client';
import type { SignPartsResponse } from '../api-responses.type';

const signParts = (id: string, parts: number[], partsDone?: number) =>
  sanctuaryApi.request<SignPartsResponse>('filesSignParts', { params: { id }, body: { parts, partsDone } });

export { signParts };
