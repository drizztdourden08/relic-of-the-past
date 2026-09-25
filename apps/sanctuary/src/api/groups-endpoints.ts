/* @layer sanctuary-site @kind logic */
/** The group routes, all admin only: list with member counts, create, patch and delete. */
import type { CreateGroupBody, PatchGroupBody } from '@shared/sanctuary/schemas/group-schemas';
import { request } from './client';
import type { DiscordRole } from '@shared/sanctuary/group-types';
import type { GroupsListResponse, GroupResponse } from './types';

const listGroups = () => request<GroupsListResponse>('groupsList');

const createGroup = (body: CreateGroupBody) => request<GroupResponse>('groupsCreate', { body });

const patchGroup = (id: string, body: PatchGroupBody) => request<GroupResponse>('groupsPatch', { params: { id }, body });

/** The server's roles for the picker; `available` is false when the API has no bot. */
const listDiscordRoles = () => request<{ roles: DiscordRole[]; available: boolean }>('discordRoles');

const deleteGroup = (id: string) => request<{ ok: true }>('groupsDelete', { params: { id } });

export { listGroups, createGroup, patchGroup, deleteGroup, listDiscordRoles };
