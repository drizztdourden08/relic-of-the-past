/* @layer site-kit @kind logic */
import { hubApi } from '../hub-client';
import type { DeviceConfirmResponse } from '../hub-responses.type';

const confirmDevice = (userCode: string) => hubApi.request<DeviceConfirmResponse>('deviceConfirm', { body: { userCode } });

export { confirmDevice };
