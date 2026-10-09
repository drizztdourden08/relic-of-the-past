/* @layer store-site @kind component */
import { SiteKit, RouteGuard, SiteFrame, SignIn } from '@rotp/design';
import { STORE_SITE_UI } from './site/site.constants';
import { HOME_PATH } from './routes.constants';
import { routes } from './routes';
import { BARRED, SIGN_IN_ART } from './App.constants';

const renderSignIn = (returnTo: string | undefined) => <SignIn lead={STORE_SITE_UI.signIn.lead} returnTo={returnTo} art={SIGN_IN_ART} />;

const App = () => (
  <SiteKit site={STORE_SITE_UI}>
    <RouteGuard
      routes={routes}
      homePath={HOME_PATH}
      signIn={renderSignIn}
      pending={BARRED}
      frame={SiteFrame}
      siteName={STORE_SITE_UI.name}
    />
  </SiteKit>
);

export { App };
