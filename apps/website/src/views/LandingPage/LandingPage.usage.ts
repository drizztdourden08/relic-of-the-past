/* @layer website-site @kind data */
import type { ComponentUsage } from '@drizztdourden08/tessera';

const usage = {
  job: 'The one page of the public website: the hero with the download button for the visitor platform, the five feature groups with their sliding cards, the open source section with live GitHub numbers, and the closing download band and the footer.',
  useWhen: ['The one root main.tsx renders inside TesseraProvider.'],
  avoidWhen: [{ case: 'The band at the top of a site with its main links.', use: 'SiteHeader' }],
  rules: [
    'Add a feature to its group file in features/groups; the card order is the array order.',
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
