/* @layer site-kit @kind component */
import { PROVIDERS } from '@shared/hub/providers';
import { Flex, Stack } from '@drizztdourden08/tessera/primitives';
import { SiteFrame } from '../../layout/SiteFrame/SiteFrame';
import { Gate } from '../../components/Gate/Gate';
import { ProviderButton } from '../../components/ProviderButton/ProviderButton';
import type { SignInProps } from './SignIn.type';

const SignIn = (props: SignInProps) => {
  const { lead, returnTo, art } = props;
  return (
    <SiteFrame bare>
      <Stack gap="lg" align="stretch">
        {art && <Flex justify="center">{art}</Flex>}
        <Gate lead={lead}>
          <Stack gap="sm" align="stretch">
            {PROVIDERS.map((provider) => (
              <ProviderButton key={provider} provider={provider} intent="signin" returnTo={returnTo} fullWidth />
            ))}
          </Stack>
        </Gate>
      </Stack>
    </SiteFrame>
  );
};

export { SignIn };
export type { SignInProps } from './SignIn.type';
