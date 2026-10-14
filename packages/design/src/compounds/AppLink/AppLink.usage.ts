/* @layer site-kit @kind data */
import type { ComponentUsage } from '@drizztdourden08/tessera';

const usage = {
  job: 'A link to another page of the same site that changes the route without a full page load.',
  useWhen: ['Any link between pages of a site that runs under SiteKit.'],
  avoidWhen: [{ case: 'A link to another site or a file.', use: 'Link' }],
  rules: ['Pass the path in to; it takes the rest of the Link props, except href, navigate and external.'],
  a11y: ['It renders a real anchor, so middle click, open in a new tab and the keyboard behave as on any link.'],
  buildingBlock: true,
  example: `import { AppLink } from '@rotp/design';\n\nconst AccountLink = () => <AppLink to="/account">Account</AppLink>;\n`,
  propsHash: '3dc0487f5455db38',
} satisfies ComponentUsage;

export { usage };
