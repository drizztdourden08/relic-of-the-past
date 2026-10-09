/* @layer site-kit @kind logic */
import { hubApi } from '../hub-client';
import type { DiscordRolesResponse } from '../hub-responses.type';

const listDiscordRoles = () => hubApi.request<DiscordRolesResponse>('discordRoles');

export { listDiscordRoles };
