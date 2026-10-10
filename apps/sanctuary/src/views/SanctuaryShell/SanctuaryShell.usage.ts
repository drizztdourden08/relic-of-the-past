/* @layer sanctuary-site @kind data */
import type { ComponentUsage } from '@drizztdourden08/tessera';

const usage = {
  job: 'The root of the Sanctuary: the site definition, the session and the route guard, which draws each member page inside SiteLayout and each gate on the brand gradient.',
  useWhen: ['The one root main.tsx renders inside TesseraProvider.'],
  avoidWhen: [{ case: 'The frame of the desktop app window.', use: 'WindowTitleBar' }],
  rules: [
    'Route a new page in routes.constants.ts and give it a section in site-sections.constants.ts.',
    'Keep the frame in SiteLayout of the design package; the pages use the app parts.',
  ],
  a11y: ['SiteLayout draws the header, the main page and the footer as landmarks.'],
  buildingBlock: true,
  example: `import { SanctuaryShell } from '@app/views/SanctuaryShell';

const ShellSample = () => <SanctuaryShell />;
`,
  propsHash: '69a6789bb8733db8',
} satisfies ComponentUsage;

export { usage };
