/* @layer renderer-app @kind data */
import type { ComponentUsage } from '@drizztdourden08/tessera';

const usage = {
  job: 'The game canvas with its overlays: the save state slots, the debug buttons and the logo shown while no game runs.',
  useWhen: ['As the body of the base screen, under every hub.'],
  avoidWhen: [{ case: 'A screen with a header and a close button.', use: 'ScreenWindow' }],
  rules: ['Read everything from useGameSession; it takes no props.'],
  a11y: ['The canvas keeps the keyboard while no screen is open.'],
  tree: { path: ['layout', 'one item in the centre'], rule: 'The body of the base screen.' },
  example: `import { GameView } from '@app/views/GameView';\n\nconst Base = () => <GameView />;\n`,
  propsHash: '69a6789bb8733db8',
} satisfies ComponentUsage;

export { usage };
