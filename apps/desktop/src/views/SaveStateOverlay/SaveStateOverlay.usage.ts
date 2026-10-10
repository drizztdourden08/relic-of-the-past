/* @layer renderer-app @kind data */
import type { ComponentUsage } from '@drizztdourden08/tessera';

const usage = {
  job: 'The quick save slots over the game, with the hold progress of a save or a load.',
  useWhen: ['Inside GameView, opened by the save state keys.'],
  avoidWhen: [{ case: 'A message that passes by itself.', use: 'Toast' }],
  rules: ['Pass open and onClose; the slot pictures load by themselves.'],
  a11y: ['The open overlay names the highlighted slot.'],
  tree: { path: ['something over the page', 'a dialog with its own layout'], rule: 'The quick save slots.' },
  example: `import { SaveStateOverlay } from '@app/views/SaveStateOverlay';\n\nconst Slots = ({ onClose }: { onClose: () => void }) => <SaveStateOverlay open onClose={onClose} />;\n`,
  propsHash: 'e400b54278f89ea4',
} satisfies ComponentUsage;

export { usage };
