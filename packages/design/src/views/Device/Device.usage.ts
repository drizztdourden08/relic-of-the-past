/* @layer site-kit @kind data */
import type { ComponentUsage } from '@drizztdourden08/tessera';

const usage = {
  job: 'The page where a person confirms a code the desktop app showed, so that the app signs in as them.',
  useWhen: ['The device route of a site, opened from the link the app shows, with the code from the address.'],
  avoidWhen: [{ case: 'A page inside the member frame.', use: 'SettingsPage' }],
  rules: [
    'Pass the code from the address as code; the person may still edit it.',
    'Show it inside the site session, so the confirmation belongs to the signed-in person.',
  ],
  a11y: ['The field is labelled Device code and errors are announced as alerts.'],
  buildingBlock: true,
  example: `import { Device } from '@rotp/design';\n\nconst DeviceRoute = () => <Device code="ABCD-1234" />;\n`,
  propsHash: 'fb18d29e6af98e90',
} satisfies ComponentUsage;

export { usage };
