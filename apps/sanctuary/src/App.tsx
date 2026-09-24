/* @layer sanctuary-site @kind component */
import { SessionProvider } from './session/SessionProvider';
import { RouteGuard } from './guard/RouteGuard';

const App = () => (
  <SessionProvider>
    <RouteGuard />
  </SessionProvider>
);

export { App };
