/* @layer store-site @kind logic */
import type { WelcomeResponse } from '@shared/store/api-types';
import type { WelcomeBody } from '@shared/store/schemas';
import { storeApi } from '../store-client';

const putWelcome = (body: WelcomeBody) => storeApi.request<WelcomeResponse>('homeWelcome', { body });

export { putWelcome };
