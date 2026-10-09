/* @layer store-site @kind logic */
import type { HomeResponse } from '@shared/store/api-types';
import { storeApi } from '../store-client';

const getHome = () => storeApi.request<HomeResponse>('home');

export { getHome };
