/* @layer renderer-app @kind data */
import type { ComponentUsage } from '@drizztdourden08/tessera';

const usage = {
  job: 'The reimagined title screen drawn over the game: the scene, the logo, the sword and the prompts.',
  useWhen: ['Inside GameOverlay, while the game is on its title screen.'],
  avoidWhen: [{ case: 'A still backdrop.', use: 'Canvas' }],
  rules: ['Pass the active profile id so the sword follows the progress.'],
  a11y: ['It is decoration over the game picture; the prompts name the buttons.'],
  tree: { path: ['data', 'a drawing', 'in pixels'], rule: 'The title screen of the game.' },
  example: `import { TitleView } from '@app/views/TitleView';

const Mounted = () => <TitleView profileId={null} />;
`,
  propsHash: 'fff95341f29ff14d',
} satisfies ComponentUsage;

export { usage };
