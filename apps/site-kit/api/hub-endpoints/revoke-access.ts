/* @layer site-kit @kind logic */
import { hubApi } from '../hub-client';

const revokeAccess = (userId: string, note = '') =>
  hubApi.request<void>('adminRevoke', { params: { userId }, body: { note } });

export { revokeAccess };
