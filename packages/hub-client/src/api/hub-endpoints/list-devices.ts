/* @layer site-kit @kind logic */
import { hubApi } from '../hub-client';
import type { DevicesResponse } from '../hub-responses.type';

const listDevices = () => hubApi.request<DevicesResponse>('devicesList');

export { listDevices };
