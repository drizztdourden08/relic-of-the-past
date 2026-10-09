/* @layer electron-main @kind types */
import type { PathParams, RouteDef } from '@shared/hub';
import type { QueryParams } from '../../hub/endpoints';

type StoreCall = { route: RouteDef; params?: PathParams; query?: QueryParams; body?: unknown };

type SignedOutError = Error & { signedOut: true };

export type { StoreCall, SignedOutError };
