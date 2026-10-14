/* @layer renderer-app @kind data */
import type { ComponentUsage } from '@drizztdourden08/tessera';

const usage = {
  job: 'The panel that names the selected item in the pause menu, with its picture.',
  useWhen: ['Inside PauseMenuView and the cheats item editor.'],
  avoidWhen: [{ case: 'A caption in a screen.', use: 'Text' }],
  rules: ['Pass the name as one line or a list of lines.', 'The glyphs shrink to fit eight columns.'],
  a11y: ['It draws game art; the editor that uses it adds its own text.'],
  buildingBlock: true,
  example: `import { PauseNamePanel } from '@app/compounds/PauseNamePanel';

const Mounted = () => <PauseNamePanel itemName="BOW" itemSprite={null} scale={2} spritesBase="" />;
`,
  propsHash: 'e2d34f5d3d6b17ba',
} satisfies ComponentUsage;

export { usage };
