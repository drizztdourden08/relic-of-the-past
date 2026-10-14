/* @layer renderer-app @kind data */
import type { ComponentUsage } from '@drizztdourden08/tessera';

const usage = {
  job: 'A field where the player pastes an SDL mapping line and adds it.',
  useWhen: ['When a controller has no mapping.'],
  avoidWhen: [{ case: 'Any other text field.', use: 'TextInput' }],
  rules: ['onSubmit resolves true when the mapping was accepted; the field clears then.'],
  a11y: ['The field has a label and a hint, and the result is text.'],
  tree: { path: ['a value the user sets', 'free text or a number', 'one line of text'], rule: 'An SDL mapping line.' },
  example: `import { MappingPasteBox } from '@app/compounds/MappingPasteBox';

const Mounted = () => <MappingPasteBox onSubmit={async () => true} />;
`,
  propsHash: 'c5201a1e82a273d7',
} satisfies ComponentUsage;

export { usage };
