/* @layer sanctuary-site @kind component */
/** The only public page: three provider buttons. Any of them; the others link later. */
import { PROVIDERS } from '@shared/sanctuary/providers';
import { Stack } from '@ds/primitives/Stack';
import { SiteFrame } from '../../layout/SiteFrame/SiteFrame';
import { Gate } from '../../components/Gate/Gate';
import { ProviderButton } from '../../components/ProviderButton/ProviderButton';

type SignInProps = {
  /** Site path to return to once signed in, when the visitor came for a specific page. */
  returnTo?: string;
};

const SignIn = (props: SignInProps) => {
  const { returnTo } = props;
  return (
    <SiteFrame bare>
      <Gate lead="The contributor space for Relic of the Past.">
        <Stack gap="sm" align="stretch">
          {PROVIDERS.map((provider) => (
            <ProviderButton key={provider} provider={provider} intent="signin" returnTo={returnTo} fullWidth />
          ))}
        </Stack>
      </Gate>
    </SiteFrame>
  );
};

export { SignIn };
export type { SignInProps };
