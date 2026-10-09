/* @layer site-kit @kind logic */
import type { PatchGroupBody } from '@rotp/hub-contracts';
import { hubApi } from '../hub-client';
import type { GroupResponse } from '../hub-responses.type';

const patchGroup = (id: string, body: PatchGroupBody) => hubApi.request<GroupResponse>('groupsPatch', { params: { id }, body });

export { patchGroup };
