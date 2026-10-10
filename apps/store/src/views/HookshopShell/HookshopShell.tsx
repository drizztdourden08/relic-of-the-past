/* @layer store-site @kind component */
import { SiteKit, RouteGuard, SignIn, SiteLayout } from '@rotp/design';
import { STORE_SITE_UI } from '../../site/site.constants';
import { HOME_PATH, ROUTES } from '../../routes.constants';
import { BARRED, SIGN_IN_ART } from './HookshopShell.constants';

const renderSignIn = (returnTo: string | undefined) => <SignIn lead={STORE_SITE_UI.signIn.lead} returnTo={returnTo} art={SIGN_IN_ART} />;

const HookshopShell = () => (
  <SiteKit site={STORE_SITE_UI}>
    <RouteGuard
      routes={ROUTES}
      homePath={HOME_PATH}
      signIn={renderSignIn}
      pending={BARRED}
      frame={SiteLayout}
      siteName={STORE_SITE_UI.name}
    />
  </SiteKit>
);

export { HookshopShell };
