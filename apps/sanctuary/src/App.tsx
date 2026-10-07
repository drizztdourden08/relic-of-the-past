/* @layer sanctuary-site @kind component */
import { SiteKit } from '@site-kit/site/SiteKit';
import { RouteGuard } from '@site-kit/guard/RouteGuard';
import { SiteFrame } from '@site-kit/layout/SiteFrame/SiteFrame';
import { SignIn } from '@site-kit/pages/SignIn/SignIn';
import { Pending } from './pages/Pending/Pending';
import { SANCTUARY_SITE_UI } from './site/site';
import { HOME_PATH, ROUTES } from './routes';

const PENDING = <Pending />;

const renderSignIn = (returnTo: string | undefined) => <SignIn lead={SANCTUARY_SITE_UI.signIn.lead} returnTo={returnTo} />;

const App = () => (
  <SiteKit site={SANCTUARY_SITE_UI}>
    <RouteGuard
      routes={ROUTES}
      homePath={HOME_PATH}
      signIn={renderSignIn}
      pending={PENDING}
      frame={SiteFrame}
      siteName={SANCTUARY_SITE_UI.name}
    />
  </SiteKit>
);

export { App };
