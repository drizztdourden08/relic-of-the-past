/* @layer electron-main @kind logic */
import type { HubApiError } from './client.type';

const isApiError = (err: unknown): err is HubApiError =>
  err instanceof Error && typeof (err as { status?: unknown }).status === 'number';

export { isApiError };
