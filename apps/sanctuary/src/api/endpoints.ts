/* @layer sanctuary-site @kind logic */
/**
 * The named calls the pages make, one function per route. Each one is the route name,
 * its parameters and its typed answer, so a page never spells a path.
 */
import type { Provider } from '@shared/sanctuary/providers';
import { request, routeHref } from './client';
import type {
  MeResponse,
  RecheckResponse,
  DevicesResponse,
  DeviceConfirmResponse,
  AdminQueueResponse,
  UserResponse,
} from './types';

type AuthIntent = 'signin' | 'link';

/** Where the browser goes to start an OAuth round trip; `returnTo` is the site path to land on. */
const authStartHref = (provider: Provider, intent: AuthIntent, returnTo?: string) =>
  routeHref('authStart', { params: { provider }, query: { intent, return: returnTo } });

const getMe = () => request<MeResponse>('me');

const recheckAccess = () => request<RecheckResponse>('meRecheck');

const unlinkProvider = (provider: Provider) => request<void>('meUnlink', { params: { provider } });

const signOut = (everywhere: boolean) =>
  request<void>('authSignOut', { query: { everywhere: everywhere ? '1' : undefined } });

const listDevices = () => request<DevicesResponse>('devicesList');

const revokeDevice = (id: string) => request<void>('devicesRevoke', { params: { id } });

const confirmDevice = (userCode: string) => request<DeviceConfirmResponse>('deviceConfirm', { body: { userCode } });

const listAdminQueue = () => request<AdminQueueResponse>('adminPending');

/** Replaces the person's manual groups; their Discord groups are not the admin's to set. */
const setUserGroups = (userId: string, groupIds: string[]) =>
  request<UserResponse>('adminSetGroups', { params: { userId }, body: { groupIds } });

const revokeAccess = (userId: string, note = '') => request<void>('adminRevoke', { params: { userId }, body: { note } });

export {
  authStartHref,
  getMe,
  recheckAccess,
  unlinkProvider,
  signOut,
  listDevices,
  revokeDevice,
  confirmDevice,
  listAdminQueue,
  setUserGroups,
  revokeAccess,
};
export type { AuthIntent };
