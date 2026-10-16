/* @layer renderer-app @kind data */
import type { ComponentUsage } from '@drizztdourden08/tessera';

const usage = {
  job: 'A small question mark button that shows a short explanation on hover, focus or click.',
  useWhen: ['Next to a label whose explanation would crowd the screen as visible text.'],
  avoidWhen: [{ case: 'Naming an icon button that has no explanation.', use: 'Tooltip' }],
  rules: ['Keep the explanation to one or two sentences.', 'Name the thing explained in label.'],
  a11y: [
    'The button is focusable and named by label.',
    'Focus or hover opens the explanation, and Escape or a click elsewhere closes it.',
  ],
  tree: {
    path: ['actions', 'one action', 'an icon only'],
    rule: 'It is one icon button whose only action is to show a hint.',
  },
  example: `import { HelpTip } from '../../compounds/HelpTip';

const HelpTipSample = () => <HelpTip label="About extraction">What extraction does.</HelpTip>;
`,
  propsHash: 'd239c26af2b0c9f4',
} satisfies ComponentUsage;

export { usage };
