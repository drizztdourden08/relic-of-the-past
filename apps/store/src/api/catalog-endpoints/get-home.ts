/* @layer store-site @kind logic */
import type { HomeResponse } from '@rotp/hub-contracts';
import { storeApi } from '../store-client';

const getHome = () => storeApi.request<HomeResponse>('home');

export { getHome };
