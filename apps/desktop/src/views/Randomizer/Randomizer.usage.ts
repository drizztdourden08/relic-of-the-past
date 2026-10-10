/* @layer renderer-app @kind data */
import type { ComponentUsage } from '@drizztdourden08/tessera';

const usage = {
  job: 'The randomizer pages: the run, the logs and the online session.',
  useWhen: ['As the body of each randomizer page, with the tab of that page.'],
  avoidWhen: [{ case: 'One page of reading.', use: 'InfoScreen' }],
  rules: ['Pass the tab and the open callback of the page.'],
  a11y: ['Each tab body starts with its own heading.'],
  tree: { path: ['a full screen view', 'working across pages, picked from a side list'], rule: 'The randomizer pages.' },
  example: `import { Randomizer } from '@app/views/Randomizer';\n\nconst Logs = ({ open }: { open: (target: string) => void }) => <Randomizer tab="logs" open={open} />;\n`,
  propsHash: '5aaf9a2bd1018946',
} satisfies ComponentUsage;

export { usage };
