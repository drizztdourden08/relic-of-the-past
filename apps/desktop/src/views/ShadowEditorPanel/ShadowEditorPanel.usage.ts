/* @layer renderer-app @kind data */
import type { ComponentUsage } from '@drizztdourden08/tessera';

const usage = {
  job: 'The Shadow Editor panel: the tool choice, the tool options and the inspector of the shape or light picked on the screen.',
  useWhen: ['As the body of the Shadow Editor widget in the Developer tools kit.'],
  avoidWhen: [{ case: 'A list of rows to pick from.', use: 'ListItemList' }],
  rules: [
    'It holds no title or buttons. The widget title strip draws ShadowEditorTools.',
    'Edits go to the shadow editor store and show in the game at once. Save writes them to the project source.',
  ],
  a11y: ['Every control is a labelled Tessera field.'],
  tree: { path: ['layout', 'panels the user docks and moves'], rule: 'The body of the Shadow Editor widget.' },
  example: `import { ShadowEditorPanel } from '@app/views/ShadowEditorPanel';

const Mounted = () => <ShadowEditorPanel />;
`,
  propsHash: '69a6789bb8733db8',
} satisfies ComponentUsage;

export { usage };
