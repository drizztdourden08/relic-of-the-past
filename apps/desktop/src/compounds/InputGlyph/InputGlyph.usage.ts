/* @layer renderer-app @kind data */
import type { ComponentUsage } from '@drizztdourden08/tessera';

const usage = {
  job: 'The picture or the key cap for one input binding, with its label.',
  useWhen: ['Wherever a screen names a button or a key.'],
  avoidWhen: [{ case: 'A keyboard shortcut in a hint.', use: 'Shortcut' }],
  rules: ['Pass a binding, or an icon id and a label; the glyph falls back to a key cap.'],
  a11y: ['The picture has the label as its alt text.'],
  tree: { path: ['data', 'controller or keyboard input', 'a keyboard with keys marked'], rule: 'The glyph of a bound input.' },
  example: `import { InputGlyph } from '@app/compounds/InputGlyph';

const Mounted = () => <InputGlyph label="Esc" />;
`,
  propsHash: 'c71e9ec6ddcf2eb8',
} satisfies ComponentUsage;

export { usage };
