/* @layer renderer-app @kind data */
import type { ComponentUsage } from '@drizztdourden08/tessera';

const usage = {
  job: 'The floating stack of debug buttons over the game, which the player can drag and which remembers where it was left.',
  useWhen: ['While a game runs and debug logging is allowed.'],
  avoidWhen: [{ case: 'A control that belongs to a screen.', use: 'Button' }],
  rules: ['Mount it once; it hides itself when logging is off or no game runs.'],
  a11y: ['Each button has a label; the stack never takes the keyboard from the game.'],
  buildingBlock: true,
  example: `import { DebugFloatingControls } from '@app/compounds/DebugFloatingControls';

const Mounted = () => <DebugFloatingControls profileId="p1" gameRunning onOpenReport={() => undefined} />;
`,
  propsHash: '28a25a3884dc897f',
} satisfies ComponentUsage;

export { usage };
