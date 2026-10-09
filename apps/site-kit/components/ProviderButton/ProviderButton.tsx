/* @layer site-kit @kind component */
import { useCallback } from 'react';
import { Icon as IconifyIcon } from '@iconify/react/offline';
import { PROVIDER_LABELS } from '@rotp/hub-contracts';
import { Button } from '@drizztdourden08/tessera/primitives';
import { authStartHref } from '../../api/hub-endpoints';
import { PROVIDER_MARKS } from './provider-marks';
import { VERB } from './ProviderButton.constants';
import type { ProviderButtonProps } from './ProviderButton.type';
import './ProviderButton.css';

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
export type { ProviderButtonProps } from './ProviderButton.type';
