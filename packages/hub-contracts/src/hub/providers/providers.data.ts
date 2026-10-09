/* @layer shared-hub @kind data */
import type { Provider } from './providers.type';

const PROVIDERS = ['discord', 'github', 'google'] as const;

const PROVIDER_LABELS: Record<Provider, string> = {
  discord: 'Discord',
  github: 'GitHub',
  google: 'Google',
};

export { PROVIDERS, PROVIDER_LABELS };
