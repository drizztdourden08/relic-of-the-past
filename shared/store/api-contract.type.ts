/* @layer shared-store @kind types */
import type { STORE_ROUTES } from './api-contract';

type StoreRoute = keyof typeof STORE_ROUTES;

export type { StoreRoute };
