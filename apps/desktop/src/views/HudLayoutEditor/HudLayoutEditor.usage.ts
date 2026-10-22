/* @layer renderer-app @kind data */
import type { ComponentUsage } from '@drizztdourden08/tessera';

const usage = {
  job: 'Edits a HUD layout: its outline, the stage preview, the inspector, the glyph packs and the saved presets.',
  useWhen: ['As the body of the HUD layout layer.'],
  avoidWhen: [{ case: 'A screen with a header over one block.', use: 'ScreenPage' }],
  rules: ['It saves through its own preset bar.'],
  a11y: ['The outline and the grid answer the arrow keys, and Escape backs out one level at a time.'],
  tree: { path: ['a full screen view', 'one big custom surface, such as calibration'], rule: 'The HUD layout editor.' },
  example: `import { HudLayoutEditor } from '@app/views/HudLayoutEditor';\n\nconst Layer = () => <HudLayoutEditor />;\n`,
  propsHash: '7a32241a8cac3085',
} satisfies ComponentUsage;

export { usage };
