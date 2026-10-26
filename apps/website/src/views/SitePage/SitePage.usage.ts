/* @layer website-site @kind data */
import type { ComponentUsage } from '@drizztdourden08/tessera';

const usage = {
  job: 'The page for the current address of the public website: the landing page for the home route, a legal document for the privacy and terms routes.',
  useWhen: ['The one root main.tsx renders it inside TesseraProvider with routeOf(location.pathname).'],
  avoidWhen: [{ case: 'The band at the top of a site with its main links.', use: 'SiteHeader' }],
  rules: ['Add a page by adding a route in routes/routes.constants.ts and one branch here.'],
  a11y: ['Each page owns its landmarks; this view adds none.'],
  buildingBlock: true,
  example: `import { routeOf } from '@app/routes';
import { SitePage } from '@app/views/SitePage';

const SiteSample = () => <SitePage route={routeOf('/privacy/')} />;
`,
  propsHash: '82f85828044c0ee0',
} satisfies ComponentUsage;

export { usage };
