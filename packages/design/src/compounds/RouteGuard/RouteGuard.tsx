/* @layer site-kit @kind component */
import type { ReactNode } from 'react';
import { Spinner, Center, Button } from '@drizztdourden08/tessera/primitives';
import { useLocation } from '../../hooks/useLocation';
import { Redirect } from '../Redirect/Redirect';
import { resolveRoute } from '../../router/route-table';
import { useSessionContext } from '../../session/session-context';
import { Gate } from '../Gate/Gate';
import { routeOutcome } from './behavior/route-outcome';
import type { RouteOutcome } from './behavior/route-outcome.type';
import type { RouteGuardProps } from './RouteGuard.type';
import './RouteGuard.css';

const RouteGuard = (props: RouteGuardProps) => {
  const { routes, homePath, signIn, pending, frame: Frame, siteName } = props;
  const { path } = useLocation();
  const session = useSessionContext();
  const { loading, error, refresh } = session;

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
  const outcomes: Record<RouteOutcome, () => ReactNode> = {
    bare: () => entry.render(params),
    'sign-in': () => signIn(path === '/' ? undefined : path),
    root: () => <Redirect to="/" />,
    home: () => <Redirect to={homePath} />,
    pending: () => pending,
    framed: () => <Frame>{entry.render(params)}</Frame>,
  };
  return outcomes[routeOutcome(entry, session)]();
};

export { RouteGuard };
export type { RouteGuardProps, FrameProps } from './RouteGuard.type';
