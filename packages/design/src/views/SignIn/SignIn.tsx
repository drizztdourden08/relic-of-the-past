/* @layer site-kit @kind component */
import { PROVIDERS } from '@rotp/hub-contracts';
import { Stack } from '@drizztdourden08/tessera/primitives';
import { Gate } from '../../compounds/Gate/Gate';
import { ProviderButton } from '../../compounds/ProviderButton/ProviderButton';
import { SIGN_IN_TITLE } from './SignIn.constants';
import type { SignInProps } from './SignIn.type';

const SignIn = (props: SignInProps) => {
  const { lead, returnTo, art } = props;
  return (
    <Gate title={SIGN_IN_TITLE} lead={lead} art={art}>
      <Stack gap="sm" align="stretch">
        {PROVIDERS.map((provider) => (
          <ProviderButton key={provider} provider={provider} intent="signin" returnTo={returnTo} fullWidth />
        ))}
      </Stack>
    </Gate>
  );
};

export { SignIn };
export type { SignInProps } from './SignIn.type';
