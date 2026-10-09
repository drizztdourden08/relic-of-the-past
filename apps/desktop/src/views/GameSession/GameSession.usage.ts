/* @layer renderer-app @kind data */
import type { ComponentUsage } from '@drizztdourden08/tessera';

const usage = {
  job: 'Holds the running game, its profile, audio, display and save state, and shares them with every screen through useGameSession.',
  useWhen: ['Once, as the Provider of the app shell module, so the base screen, the hubs and the title bar items read one session.'],
  avoidWhen: [{ case: 'A full screen frame with navigation.', use: 'SideNavLayout' }],
  rules: ['Render it around the whole shell; a popped widget window gets the data view storage only.'],
  a11y: ['It draws no element of its own beside the update dialog and, on Android, the menu drawer.'],
  tree: { path: ['layout', 'the app root'], rule: 'The one provider of the game session.' },
  example: `import { GameSession } from '@app/views/GameSession';\n\nconst Shell = ({ children }: { children: React.ReactNode }) => <GameSession>{children}</GameSession>;\n`,
  propsHash: '1bc5bf568a454eb2',
} satisfies ComponentUsage;

export { usage };
