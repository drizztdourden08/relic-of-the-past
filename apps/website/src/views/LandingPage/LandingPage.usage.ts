/* @layer website-site @kind data */
import type { ComponentUsage } from '@drizztdourden08/tessera';

const usage = {
  job: 'The one page of the public website: the hero over one world that flows into the five feature groups, one feature per row with a visual that shows it, a side timeline, the open source section with live GitHub numbers and the footer.',
  useWhen: ['The one root main.tsx renders inside TesseraProvider.'],
  avoidWhen: [{ case: 'The band at the top of a site with its main links.', use: 'SiteHeader' }],
  rules: [
    'Add a feature to its group file in features/groups; the row order is the array order and the timeline follows it.',
    'The download button reads the latest GitHub release and falls back to the releases page when the request fails.',
  ],
  a11y: ['The hero is the header landmark, the features are the main landmark and the footer is the footer landmark.'],
  buildingBlock: true,
  example: `import { LandingPage } from '@app/views/LandingPage';

const LandingSample = () => <LandingPage />;
`,
  propsHash: '69a6789bb8733db8',
} satisfies ComponentUsage;

export { usage };
