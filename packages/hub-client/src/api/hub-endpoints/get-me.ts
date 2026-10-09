/* @layer site-kit @kind logic */
import { hubApi } from '../hub-client';
import type { MeResponse } from '../hub-responses.type';

const getMe = () => hubApi.request<MeResponse>('me');

export { getMe };
