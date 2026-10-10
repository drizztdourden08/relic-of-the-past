/* @layer site-kit @kind data */
import type { ComponentUsage } from '@drizztdourden08/tessera';

const usage = {
  job: 'A site page outside the member frame: the rotp mark and the site wordmark over one Card on the brand gradient, with a lead line and the page actions.',
  useWhen: [
    'Sign in, waiting for access, a device code to confirm, or a page that failed to load.',
    'Any site page a visitor sees before or instead of the member frame.',
  ],
  avoidWhen: [{ case: 'A page inside the member frame.', use: 'SettingsPage' }],
  rules: [
    'Put the actions in children and keep the lead to one or two lines.',
    'Render it inside SiteKit, which gives it the site wordmark.',
  ],
  a11y: ['It is the main landmark of the page, the card title its heading, and the mark links home.'],
  buildingBlock: true,
  example: `import { Gate } from '@rotp/design';

const GateSample = () => <Gate title="Almost there" lead="The Hookshop has not set up your account yet." />;
`,
  propsHash: '4c88483a233748a6',
} satisfies ComponentUsage;

export { usage };
