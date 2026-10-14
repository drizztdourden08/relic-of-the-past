/* @layer site-kit @kind data */
import type { ComponentUsage } from '@drizztdourden08/tessera';

const usage = {
  job: 'The account page of a site: the display name, the access state and groups, the sign-in methods, the signed-in devices and the sign-out buttons.',
  useWhen: ['The account route of a site, inside SiteLayout.'],
  avoidWhen: [{ case: 'A page of other settings.', use: 'SettingsPage' }],
  rules: [
    'Mount it as a route; it reads the session itself and takes no props.',
    'It draws nothing until a person is signed in.',
  ],
  a11y: ['The sections are headed and reachable from the page anchors; errors are announced as alerts.'],
  buildingBlock: true,
  example: `import { Account } from '@rotp/design';\n\nconst AccountRoute = () => <Account />;\n`,
  propsHash: '69a6789bb8733db8',
} satisfies ComponentUsage;

export { usage };
