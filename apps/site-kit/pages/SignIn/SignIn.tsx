/* @layer site-kit @kind component */
/** The only public page: three provider buttons under the site's own line. Any of them; the others link later. */
import { PROVIDERS } from '@shared/hub/providers';
import { Stack } from '@ds/primitives/Stack';
import { SiteFrame } from '../../layout/SiteFrame/SiteFrame';
import { Gate } from '../../components/Gate/Gate';
import { ProviderButton } from '../../components/ProviderButton/ProviderButton';

type SignInProps = {
  /** The site's one line under its brand. */
  lead: string;
  /** Site path to return to once signed in, when the visitor came for a specific page. */
  returnTo?: string;
};

const SignIn = (props: SignInProps) => {
  const { lead, returnTo } = props;
  return (
    <SiteFrame bare>
      <Gate lead={lead}>
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
