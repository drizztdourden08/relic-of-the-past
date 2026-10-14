/* @layer renderer-app @kind data */
import type { ComponentUsage } from '@drizztdourden08/tessera';

const usage = {
  job: 'A line of HUD text in a game font or from sprite glyphs, sized to its content.',
  useWhen: ['Inside HudNodeRenderer, for a text element.'],
  avoidWhen: [{ case: 'Text in a screen.', use: 'Text' }],
  rules: ['Pass the scope that resolves the text of the spec.'],
  a11y: ['It is decoration over the game picture.'],
  buildingBlock: true,
  example: `import type { ComponentProps } from 'react';
import { HudText } from '@app/compounds/HudText';

const Mounted = (props: ComponentProps<typeof HudText>) => <HudText {...props} />;
`,
  propsHash: 'f306e42a23640f22',
} satisfies ComponentUsage;

export { usage };
