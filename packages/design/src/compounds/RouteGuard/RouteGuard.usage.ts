/* @layer site-kit @kind data */
import type { ComponentUsage } from '@drizztdourden08/tessera';

const usage = {
  job: 'The router of a site: it matches the path to a route and lets the session decide between the page in its frame, the sign-in page, the pending page or a redirect.',
  useWhen: ['The root of a site, inside SiteKit, with the site routes and SiteLayout as the frame.'],
  avoidWhen: [{ case: 'Pages of the desktop app.', use: 'WorkspaceScreen' }],
  rules: [
    'List the routes in order; the first pattern that matches wins.',
    'Mark a route bare when it draws its own Gate, public when a signed-out visitor may see it.',
  ],
  a11y: ['Loading, an unreachable API and a missing page each show a Gate with a heading.'],
  buildingBlock: true,
  example: `import { RouteGuard, SignIn, SiteLayout } from '@rotp/design';

const GuardSample = () => (
  <RouteGuard routes={[]} homePath="/" signIn={() => <SignIn lead="Sign in." />} pending={null} frame={SiteLayout} siteName="Site" />
);
`,
  propsHash: '290983c302291530',
} satisfies ComponentUsage;

export { usage };
