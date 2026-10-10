/* @layer site-kit @kind data */
import type { ComponentUsage } from '@drizztdourden08/tessera';

const usage = {
  job: 'The frame of every member page of a site: SiteHeader with the rotp mark, the site wordmark and the signed-in person, SideNavLayout with the sections and the site search, and SiteFooter.',
  useWhen: ['The frame RouteGuard draws around each member route of the Sanctuary and the Hookshop.'],
  avoidWhen: [
    { case: 'A page before sign-in or while access is pending; the Gate compound draws it.', use: 'Card' },
    { case: 'The frame of the desktop app window.', use: 'WindowTitleBar' },
  ],
  rules: [
    'Pass it to RouteGuard as frame; the pages inside are SettingsPage and the other app parts.',
    'The sections, the search and the footer come from the site definition of SiteKit.',
  ],
  a11y: ['The header, the main page and the footer are landmarks; the person is a menu button.'],
  buildingBlock: true,
  example: `import { SiteLayout } from '@rotp/design';

const LayoutSample = () => <SiteLayout>{null}</SiteLayout>;
`,
  propsHash: '1bc5bf568a454eb2',
} satisfies ComponentUsage;

export { usage };
