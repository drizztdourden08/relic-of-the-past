/* @layer site-kit @kind logic */
import { hubApi } from '../hub-client';
import type { GroupsListResponse } from '../hub-responses.type';

const listGroups = () => hubApi.request<GroupsListResponse>('groupsList');

export { listGroups };
