/* @layer site-kit @kind logic */
import { hubApi } from '../hub-client';
import type { AdminQueueResponse } from '../hub-responses.type';

const listAdminQueue = () => hubApi.request<AdminQueueResponse>('adminPending');

export { listAdminQueue };
