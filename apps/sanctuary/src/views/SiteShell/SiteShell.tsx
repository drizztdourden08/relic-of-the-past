/* @layer sanctuary-site @kind component */
import { SiteKit, RouteGuard, SignIn, SiteLayout } from '@rotp/design';
import { Pending } from '../../pages/Pending/Pending';
import { SANCTUARY_SITE_UI } from '../../site/site.constants';
import { HOME_PATH, ROUTES } from '../../routes.constants';

const pendingPage = <Pending />;

const renderSignIn = (returnTo: string | undefined) => <SignIn lead={SANCTUARY_SITE_UI.signIn.lead} returnTo={returnTo} />;

const SiteShell = () => (
  <SiteKit site={SANCTUARY_SITE_UI}>
    <RouteGuard
      routes={ROUTES}
      homePath={HOME_PATH}
      signIn={renderSignIn}
      pending={pendingPage}
      frame={SiteLayout}
      siteName={SANCTUARY_SITE_UI.name}
    />
  </SiteKit>
);

export { SiteShell };
