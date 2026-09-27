/* @layer store-site @kind component */
import { SiteKit } from '@site-kit/site/SiteKit';
import { RouteGuard } from '@site-kit/guard/RouteGuard';
import { SiteFrame } from '@site-kit/layout/SiteFrame/SiteFrame';
import { SignIn } from '@site-kit/pages/SignIn/SignIn';
import { Barred } from './pages/Barred/Barred';
import { STORE_SITE_UI } from './site/site';
import { HOME_PATH, ROUTES } from './routes';

const BARRED = <Barred />;

const renderSignIn = (returnTo: string | undefined) => <SignIn lead={STORE_SITE_UI.signIn.lead} returnTo={returnTo} />;

const App = () => (
  <SiteKit site={STORE_SITE_UI}>
    <RouteGuard
      routes={ROUTES}
      homePath={HOME_PATH}
      signIn={renderSignIn}
      pending={BARRED}
      frame={SiteFrame}
      siteName={STORE_SITE_UI.name}
    />
  </SiteKit>
);

export { App };
