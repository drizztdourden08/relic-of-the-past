/* @layer renderer-app @kind data */
import type { ComponentUsage } from '@drizztdourden08/tessera';

const usage = {
  job: 'A still picture of the title scene, drawn behind a page and sized to fill it.',
  useWhen: ['Behind a hub or a page that wants the look of the title screen.'],
  avoidWhen: [{ case: 'A moving scene.', use: 'Canvas' }],
  rules: ['Pass a seed to change the scene and a horizon to move the water line.'],
  a11y: ['It is hidden from assistive tools.'],
  tree: { path: ['data', 'a drawing', 'in pixels'], rule: 'The still scene behind a page.' },
  example: `import { SceneBackdrop } from '@app/views/SceneBackdrop';

const Mounted = () => <SceneBackdrop seed={7} />;
`,
  propsHash: 'd90d2f8ae9e6707b',
} satisfies ComponentUsage;

export { usage };
