/* @layer site-kit @kind component */
/**
 * Decides what the current path shows from the session: signed out sees Sign in, a
 * pending or revoked user sees the waiting page, a member sees the page inside the
 * member frame, an admin route sends a non-admin home, and a route needing a permission
 * the caller lacks sends them home too.
 */
import type { ComponentType, ReactNode } from 'react';
import { Spinner } from '@ds/primitives/Spinner';
import { Center } from '@ds/primitives/Center';
import { Button } from '@ds/primitives/Button';
import { hasRight } from '@shared/hub/rights';
import { useLocation } from '../router/useLocation';
import { Redirect } from '../router/Redirect';
import { resolveRoute } from '../router/route-table';
import type { RouteEntry } from '../router/route-table';
import { useSessionContext } from '../session/session-context';
import { Gate } from '../components/Gate/Gate';
import './RouteGuard.css';

type FrameProps = { bare?: boolean; children: ReactNode };

type RouteGuardProps = {
  routes: readonly RouteEntry[];
  /** Where a route the caller may not see sends them. */
  homePath: string;
  /** The sign-in page, told where to return once signed in. */
  signIn: (returnTo: string | undefined) => ReactNode;
  /** The waiting page for a pending or revoked user. */
  pending: ReactNode;
  frame: ComponentType<FrameProps>;
  siteName: string;
};

const RouteGuard = (props: RouteGuardProps) => {
  const { routes, homePath, signIn, pending, frame: Frame, siteName } = props;
  const { path } = useLocation();
  const { me, access, rights, loading, error, refresh } = useSessionContext();

  if (loading) {
    return (
      <Frame bare>
        <Center className="guard__loading"><Spinner size="lg" /></Center>
      </Frame>
    );
  }

  if (error) {
    return (
      <Frame bare>
        <Gate title={`${siteName} is unreachable`} lead={error}>
          <Button variant="primary" onClick={() => void refresh()}>Try again</Button>
        </Gate>
      </Frame>
    );
  }

  const match = resolveRoute(routes, path);
  if (!match) {
    return (
      <Frame bare>
        <Gate title="Not found" lead={`There is no page at ${path}.`}>
          <Button variant="tertiary" onClick={() => window.history.back()}>Go back</Button>
        </Gate>
      </Frame>
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
  // The one member frame: same element at the same place for every member route, so the
  // nav, the search and the shared lists stay mounted while the page beneath them changes.
  return <Frame>{entry.render(params)}</Frame>;
};

export { RouteGuard };
export type { RouteGuardProps, FrameProps };
