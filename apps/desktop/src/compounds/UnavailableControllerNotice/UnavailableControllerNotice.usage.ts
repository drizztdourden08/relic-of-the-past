/* @layer renderer-app @kind data */
import type { ComponentUsage } from '@drizztdourden08/tessera';

const usage = {
  job: 'A notice that a controller is not supported, with a way to paste a mapping for it.',
  useWhen: ['When a connected controller has no mapping.'],
  avoidWhen: [{ case: 'A message that passes.', use: 'Toast' }],
  rules: ['onAddMapping resolves true when the mapping was accepted.'],
  a11y: ['The notice is text and the field has a label.'],
  tree: { path: ['feedback', 'a note that stays on the page'], rule: 'A controller with no mapping.' },
  example: `import { UnavailableControllerNotice } from '@app/compounds/UnavailableControllerNotice';

const Mounted = () => <UnavailableControllerNotice onAddMapping={async () => true} />;
`,
  propsHash: '6e5f7026f23b1686',
} satisfies ComponentUsage;

export { usage };
