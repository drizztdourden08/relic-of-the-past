/* @layer sanctuary-site @kind component */
/**
 * One sign-in or link button per identity provider, in that provider's own button
 * style and mark. It sends the browser to the API's start route, which redirects to
 * the provider; there is nothing to fetch.
 */
import { useCallback } from 'react';
import { Icon as IconifyIcon } from '@iconify/react/offline';
import type { Provider } from '@shared/sanctuary/providers';
import { PROVIDER_LABELS } from '@shared/sanctuary/providers';
import { Button } from '@ds/primitives/Button';
import { authStartHref } from '../../api/endpoints';
import type { AuthIntent } from '../../api/endpoints';
import { PROVIDER_MARKS } from './provider-marks';
import './ProviderButton.css';

type ProviderButtonProps = {
  provider: Provider;
  intent: AuthIntent;
  /** Site path to land on after the round trip; defaults to the API's own choice. */
  returnTo?: string;
  fullWidth?: boolean;
};

const VERB: Record<AuthIntent, string> = { signin: 'Continue with', link: 'Link' };

const ProviderButton = (props: ProviderButtonProps) => {
  const { provider, intent, returnTo, fullWidth = false } = props;
  const handleClick = useCallback(() => {
    window.location.assign(authStartHref(provider, intent, returnTo));
  }, [provider, intent, returnTo]);
  return (
    <Button
      className={`provider-btn provider-btn--${provider}`}
      fullWidth={fullWidth}
      icon={<IconifyIcon icon={PROVIDER_MARKS[provider]} />}
      onClick={handleClick}
    >
      {VERB[intent]} {PROVIDER_LABELS[provider]}
    </Button>
  );
};

export { ProviderButton };
export type { ProviderButtonProps };
