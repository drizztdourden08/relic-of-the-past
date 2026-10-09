/* @layer site-kit @kind logic */
import { hubApi } from '../hub-client';

const revokeDevice = (id: string) => hubApi.request<void>('devicesRevoke', { params: { id } });

export { revokeDevice };
