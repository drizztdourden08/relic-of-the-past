/* @layer site-kit @kind logic */
import type { Provider } from '@shared/hub/providers';
import { hubApi } from '../hub-client';
import type { AuthIntent } from './hub-endpoints.type';

const authStartHref = (provider: Provider, intent: AuthIntent, returnTo?: string) =>
  hubApi.routeHref('authStart', { params: { provider }, query: { intent, return: returnTo } });

export { authStartHref };
