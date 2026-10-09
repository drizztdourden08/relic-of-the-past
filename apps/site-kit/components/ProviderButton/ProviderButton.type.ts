/* @layer site-kit @kind types */
import type { Provider } from '@rotp/hub-contracts';
import type { AuthIntent } from '../../api/hub-endpoints';

type ProviderButtonProps = {
  provider: Provider;
  intent: AuthIntent;
  returnTo?: string;
  fullWidth?: boolean;
};

export type { ProviderButtonProps };
