/* @layer renderer-app @kind data */
import type { ComponentUsage } from '@drizztdourden08/tessera';

const usage = {
  job: 'A notice over the game that says the enhanced HUD cannot be drawn and why.',
  useWhen: ['Inside GameOverlay, when the HUD style needs art that is missing.'],
  avoidWhen: [{ case: 'A message that passes.', use: 'Toast' }],
  rules: ['It takes no props.'],
  a11y: ['The notice is text.'],
  tree: { path: ['feedback', 'a note that stays on the page'], rule: 'The HUD cannot be drawn.' },
  example: `import { HudUnavailableNotice } from '@app/views/HudUnavailableNotice';

const Mounted = () => <HudUnavailableNotice />;
`,
  propsHash: '69a6789bb8733db8',
} satisfies ComponentUsage;

export { usage };
