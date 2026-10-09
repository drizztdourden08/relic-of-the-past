/* @layer site-kit @kind logic */
import { hubApi } from '../hub-client';
import type { RecheckResponse } from '../hub-responses.type';

const recheckAccess = () => hubApi.request<RecheckResponse>('meRecheck');

export { recheckAccess };
