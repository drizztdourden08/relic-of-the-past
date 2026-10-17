/* @layer renderer-app @kind data */
import type { ComponentUsage } from '@drizztdourden08/tessera';

const usage = {
  job: 'The canvas over the game picture where shadow shapes and lights are drawn, picked and dragged.',
  useWhen: ['As the Shadow drawing overlay of the Shadow Editor kit.'],
  avoidWhen: [{ case: 'A drawing that is not the shadow layer.', use: 'Canvas' }],
  rules: [
    'It matches the size of the game picture, read from the game fit store.',
    'In preview mode it draws nothing and lets the pointer through.',
  ],
  a11y: ['The canvas is a pointer tool. The same edits are in the Shadow Editor panel.'],
  tree: { path: ['data', 'a drawing', 'in pixels'], rule: 'The shadow editing layer over the game picture.' },
  example: `import { ShadowEditorOverlay } from '@app/views/ShadowEditorOverlay';

const Mounted = () => <ShadowEditorOverlay />;
`,
  propsHash: '69a6789bb8733db8',
} satisfies ComponentUsage;

export { usage };
