/* @layer sanctuary-site @kind logic */
/** The group routes, all admin only: list with member counts, create, patch and delete. */
import type { CreateGroupBody, PatchGroupBody } from '@shared/sanctuary/schemas/group-schemas';
import { request } from './client';
import type { GroupsListResponse, GroupResponse } from './types';

const listGroups = () => request<GroupsListResponse>('groupsList');

const createGroup = (body: CreateGroupBody) => request<GroupResponse>('groupsCreate', { body });

const patchGroup = (id: string, body: PatchGroupBody) => request<GroupResponse>('groupsPatch', { params: { id }, body });

const deleteGroup = (id: string) => request<{ ok: true }>('groupsDelete', { params: { id } });

export { listGroups, createGroup, patchGroup, deleteGroup };
