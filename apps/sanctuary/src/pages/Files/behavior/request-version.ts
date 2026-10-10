/* @layer sanctuary-site @kind logic */
import type { DropQueue, VersionRequest } from './drop-queue.type';

const requestVersion = (state: DropQueue, request: VersionRequest): DropQueue => ({ ...state, version: request });

export { requestVersion };
