/* @layer site-kit @kind logic */
/** The group routes, all admin only: list with member counts, create, patch, delete and the Discord roles. */
import type { CreateGroupBody, PatchGroupBody } from '@shared/hub/schemas/group-schemas';
import { hubApi } from './hub-client';
import type { DiscordRolesResponse, GroupsListResponse, GroupResponse } from './hub-responses.type';

const listGroups = () => hubApi.request<GroupsListResponse>('groupsList');

const createGroup = (body: CreateGroupBody) => hubApi.request<GroupResponse>('groupsCreate', { body });

const patchGroup = (id: string, body: PatchGroupBody) => hubApi.request<GroupResponse>('groupsPatch', { params: { id }, body });

/** The server's roles for the picker; `available` is false when the API has no bot. */
const listDiscordRoles = () => hubApi.request<DiscordRolesResponse>('discordRoles');

const deleteGroup = (id: string) => hubApi.request<{ ok: true }>('groupsDelete', { params: { id } });

export { listGroups, createGroup, patchGroup, deleteGroup, listDiscordRoles };
