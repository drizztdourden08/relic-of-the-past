/* @layer site-kit @kind data */
import type { ComponentUsage } from '@drizztdourden08/tessera';

const usage = {
  job: 'The context of a site: its definition (brand, footer, sections, search, rights editors) and the signed-in session, for every site part under it.',
  useWhen: ['Once, at the root of a site, around RouteGuard.'],
  avoidWhen: [{ case: 'The desktop app, which keeps its own session.', use: 'TesseraProvider' }],
  rules: ['Keep the site definition in the site, in site/site.constants.ts, and pass it here.'],
  a11y: ['It draws nothing of its own.'],
  buildingBlock: true,
  example: `import { SiteKit } from '@rotp/design';
import type { SiteDefinition } from '@rotp/design';

const KitSample = ({ site }: { site: SiteDefinition }) => <SiteKit site={site}>{null}</SiteKit>;
`,
  propsHash: 'f8c92d295a85ce74',
} satisfies ComponentUsage;

export { usage };
