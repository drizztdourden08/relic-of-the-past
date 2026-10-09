/* @layer site-kit @kind component */
import { Spinner, Center, Button } from '@drizztdourden08/tessera/primitives';
import { hasRight } from '@rotp/hub-contracts';
import { useLocation } from '../../hooks/useLocation';
import { Redirect } from '../Redirect/Redirect';
import { resolveRoute } from '../../router/route-table';
import { useSessionContext } from '../../session/session-context';
import { Gate } from '../Gate/Gate';
import type { RouteGuardProps } from './RouteGuard.type';
import './RouteGuard.css';

const RouteGuard = (props: RouteGuardProps) => {
  const { routes, homePath, signIn, pending, frame: Frame, siteName } = props;
  const { path } = useLocation();
  const { me, access, rights, loading, error, refresh } = useSessionContext();

  if (loading) {
    return (
      <Gate>
        <Center className="guard__loading"><Spinner size="lg" /></Center>
      </Gate>
    );
  }

  if (error) {
    return (
      <Gate title={`${siteName} is unreachable`} lead={error}>
        <Button variant="primary" onClick={() => void refresh()}>Try again</Button>
      </Gate>
    );
  }

  const match = resolveRoute(routes, path);
  if (!match) {
    return (
      <Gate title="Not found" lead={`There is no page at ${path}.`}>
        <Button variant="tertiary" onClick={() => window.history.back()}>Go back</Button>
      </Gate>
    );
  }

  const { entry, params } = match;
  if (!me) {
    if (entry.access === 'public') return entry.render(params);
    return signIn(path === '/' ? undefined : path);
  }
  if (entry.access === 'public') return <Redirect to="/" />;
  if (!access || access.state === 'pending' || access.state === 'revoked') return pending;
  if (entry.access === 'admin' && access.state !== 'admin') return <Redirect to="/" />;
  if (entry.permission && !hasRight(rights, entry.permission)) return <Redirect to={homePath} />;
  if (entry.bare) return entry.render(params);
  return <Frame>{entry.render(params)}</Frame>;
};

export { RouteGuard };
export type { RouteGuardProps, FrameProps } from './RouteGuard.type';
