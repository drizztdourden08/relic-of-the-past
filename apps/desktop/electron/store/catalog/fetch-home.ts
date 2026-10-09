/* @layer electron-main @kind logic */
import { STORE_ROUTES } from '@shared/store/api-contract';
import type { HomeResponse } from '@shared/store/api-types';
import { callStore } from '../store-client';

const fetchHome = (): Promise<HomeResponse> => callStore<HomeResponse>({ route: STORE_ROUTES.home });

export { fetchHome };
