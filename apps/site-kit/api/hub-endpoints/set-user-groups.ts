/* @layer site-kit @kind logic */
import { hubApi } from '../hub-client';
import type { UserResponse } from '../hub-responses.type';

const setUserGroups = (userId: string, groupIds: string[]) =>
  hubApi.request<UserResponse>('adminSetGroups', { params: { userId }, body: { groupIds } });

export { setUserGroups };
