/* @layer electron-main @kind logic */
import { apiError } from './api-error';
import { HUB_UNREACHABLE_MESSAGE, HUB_UNREACHABLE_STATUS } from './client.constants';

const reachHub = async (input: string | URL | Request, init?: RequestInit): Promise<Response> => {
  try {
    return await fetch(input, init);
  } catch {
    throw apiError(HUB_UNREACHABLE_STATUS, HUB_UNREACHABLE_MESSAGE);
  }
};

export { reachHub };
