/* @layer sanctuary-site @kind component */
/**
 * Decides what the current path shows from the session: signed out sees Sign in, a
 * pending or revoked user sees the waiting page, a member sees the page inside the
 * member frame, and an admin route sends a non-admin home.
 */
import { Spinner } from '@ds/primitives/Spinner';
import { Center } from '@ds/primitives/Center';
import { Button } from '@ds/primitives/Button';
import { useLocation } from '../router/useLocation';
import { Redirect } from '../router/Redirect';
import { useSessionContext } from '../session/session-context';
import { resolveRoute } from '../routes';
import { SiteFrame } from '../layout/SiteFrame/SiteFrame';
import { Gate } from '../components/Gate/Gate';
import { SignIn } from '../pages/SignIn/SignIn';
import { Pending } from '../pages/Pending/Pending';
import './RouteGuard.css';

const RouteGuard = () => {
  const { path } = useLocation();
  const { me, access, loading, error, refresh } = useSessionContext();

  if (loading) {
    return (
      <SiteFrame bare>
        <Center className="guard__loading"><Spinner size="lg" /></Center>
      </SiteFrame>
    );
  }

  if (error) {
    return (
      <SiteFrame bare>
        <Gate title="Sanctuary is unreachable" lead={error}>
          <Button variant="primary" onClick={() => void refresh()}>Try again</Button>
        </Gate>
      </SiteFrame>
    );
  }

  const match = resolveRoute(path);
  if (!match) {
    return (
      <SiteFrame bare>
        <Gate title="Not found" lead={`There is no page at ${path}.`}>
          <Button variant="tertiary" onClick={() => window.history.back()}>Go back</Button>
        </Gate>
      </SiteFrame>
    );
  }

  const { entry, params } = match;
  if (!me || !access) {
    if (entry.access === 'public') return entry.render(params);
    return <SignIn returnTo={path === '/' ? undefined : path} />;
  }
  if (entry.access === 'public') return <Redirect to="/" />;
  if (access.state === 'pending' || access.state === 'revoked') return <Pending />;
  if (entry.access === 'admin' && access.state !== 'admin') return <Redirect to="/" />;
  if (entry.bare) return entry.render(params);
  // The one member frame: same element at the same place for every member route, so the
  // nav, the search and the shared lists stay mounted while the page beneath them changes.
  return <SiteFrame>{entry.render(params)}</SiteFrame>;
};

export { RouteGuard };
