/* @layer renderer-app @kind data */
import type { ComponentUsage } from '@drizztdourden08/tessera';

const usage = {
  job: 'A button that scans for controllers again and shows that it is working.',
  useWhen: ['In the input settings, next to the controller list.'],
  avoidWhen: [{ case: 'Any other action.', use: 'Button' }],
  rules: ['Pass isPending while the scan runs.'],
  a11y: ['The button names its action and is busy while pending.'],
  buildingBlock: true,
  example: `import { RescanButton } from '@app/compounds/RescanButton';

const Mounted = () => <RescanButton isPending={false} onRescan={() => undefined} />;
`,
  propsHash: 'ca050cbc8d59b6dd',
} satisfies ComponentUsage;

export { usage };
