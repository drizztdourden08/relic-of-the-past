/* @layer store-site @kind logic */
import type { WelcomeResponse } from '@rotp/hub-contracts';
import type { WelcomeBody } from '@rotp/hub-contracts';
import { storeApi } from '../store-client';

const putWelcome = (body: WelcomeBody) => storeApi.request<WelcomeResponse>('homeWelcome', { body });

export { putWelcome };
