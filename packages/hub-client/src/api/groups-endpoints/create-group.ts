/* @layer site-kit @kind logic */
import type { CreateGroupBody } from '@rotp/hub-contracts';
import { hubApi } from '../hub-client';
import type { GroupResponse } from '../hub-responses.type';

const createGroup = (body: CreateGroupBody) => hubApi.request<GroupResponse>('groupsCreate', { body });

export { createGroup };
