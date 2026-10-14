/* @layer site-kit @kind data */
import type { ComponentUsage } from '@drizztdourden08/tessera';

const usage = {
  job: 'The admin page of a site: the groups with their rights and Discord roles, and the people who are pending, members or revoked.',
  useWhen: ['The admin route of a site, inside SiteLayout, for people who may manage access.'],
  avoidWhen: [{ case: 'A page of other settings.', use: 'SettingsPage' }],
  rules: [
    'Mount it as a route; it loads the people and the groups itself and takes no props.',
    'The rights editors of each group come from the site definition.',
  ],
  a11y: ['The sections are headed and reachable from the page anchors; errors are announced as alerts.'],
  buildingBlock: true,
  example: `import { Admin } from '@rotp/design';\n\nconst AdminRoute = () => <Admin />;\n`,
  propsHash: '69a6789bb8733db8',
} satisfies ComponentUsage;

export { usage };
