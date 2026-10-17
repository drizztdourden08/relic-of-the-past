/* @layer renderer-app @kind data */
import type { ComponentUsage } from '@drizztdourden08/tessera';

const usage = {
  job: 'The shapes and lights of the screen the game shows, one row each, to pick one for the Shadow Editor.',
  useWhen: ['As the body of the Shadow Elements widget in the Shadow Editor kit.'],
  avoidWhen: [{ case: 'Editing a record field by field.', use: 'RecordEditor' }],
  rules: ['It follows the screen the game shows and the pick lives in the shadow editor store.'],
  a11y: ['Each row is a button with its name and value.'],
  tree: { path: ['layout', 'panels the user docks and moves'], rule: 'The body of the Shadow Elements widget.' },
  example: `import { ShadowElementList } from '@app/views/ShadowElementList';

const Mounted = () => <ShadowElementList />;
`,
  propsHash: '69a6789bb8733db8',
} satisfies ComponentUsage;

export { usage };
