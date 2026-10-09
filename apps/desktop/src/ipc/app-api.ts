/* @layer renderer-app @kind logic */
import type { AppApi } from './app-api.type';

const appApi = (): AppApi => (window as unknown as { api: AppApi }).api;

export { appApi };
