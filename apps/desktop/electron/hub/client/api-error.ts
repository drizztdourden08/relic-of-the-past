/* @layer electron-main @kind logic */
import type { HubApiError } from './client.type';

const apiError = (status: number, message: string): HubApiError =>
  Object.assign(new Error(message), { name: 'HubApiError', status });

export { apiError };
