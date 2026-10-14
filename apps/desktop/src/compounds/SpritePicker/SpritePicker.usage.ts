/* @layer renderer-app @kind data */
import type { ComponentUsage } from '@drizztdourden08/tessera';

const usage = {
  job: 'A popup that picks one sprite from tabs of tiles.',
  useWhen: ['When the player chooses a sprite for the hero or a slot.'],
  avoidWhen: [{ case: 'A list of text options.', use: 'Select' }],
  rules: ['Anchor it to the button that opens it.', 'Close it on pick and on outside click.'],
  a11y: ['Each tile is a button with the sprite name.'],
  tree: { path: ['a value the user sets', 'one choice', 'many, in a list'], rule: 'A sprite from tabs of tiles.' },
  example: `import type { ComponentProps } from 'react';
import { SpritePicker } from '@app/compounds/SpritePicker';

const Mounted = (props: ComponentProps<typeof SpritePicker>) => <SpritePicker {...props} />;
`,
  propsHash: '30a9df69b3fc85e8',
} satisfies ComponentUsage;

export { usage };
