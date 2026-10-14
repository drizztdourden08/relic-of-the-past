/* @layer renderer-app @kind data */
import type { ComponentUsage } from '@drizztdourden08/tessera';

const usage = {
  job: 'The button prompts shown under a dialog box, such as A to continue.',
  useWhen: ['Inside DialogView, when button prompts are on.'],
  avoidWhen: [{ case: 'A hint line in a window.', use: 'Shortcut' }],
  rules: ['Pass the box rectangle so the prompts sit under it and stay inside the limit.'],
  a11y: ['It is decoration over the game picture and takes no focus.'],
  buildingBlock: true,
  example: `import type { ComponentProps } from 'react';
import { DialogPrompts } from '@app/compounds/DialogPrompts';

const Mounted = (props: ComponentProps<typeof DialogPrompts>) => <DialogPrompts {...props} />;
`,
  propsHash: '7bb757c385dc7b37',
} satisfies ComponentUsage;

export { usage };
