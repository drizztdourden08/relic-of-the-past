/* @layer renderer-app @kind data */
import type { ComponentUsage } from '@drizztdourden08/tessera';

const usage = {
  job: 'The frame of every page of the site: SiteHeader with the brand, the links and the signed-in person, the page, and SiteFooter.',
  useWhen: ['The root of a site made with brock site add; each page renders inside it.'],
  avoidWhen: [{ case: 'The frame of the desktop app window.', use: 'WindowTitleBar' }],
  rules: [
    'Route a new page by its path in SiteShell and add its link to SITE_LINKS.',
    'Draw the signed-in person with profileAction, the same dropdown action the app title bar takes.',
    'Keep the pages on the app parts; the header and the footer are the only site-only parts.',
  ],
  a11y: ['The header, the main page and the footer are landmarks.'],
  buildingBlock: true,
  example: `import { SiteShell } from '@app/views/SiteShell';

const ShellSample = () => <SiteShell />;
`,
  propsHash: '69a6789bb8733db8',
} satisfies ComponentUsage;

export { usage };
