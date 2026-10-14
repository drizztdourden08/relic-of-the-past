/* @layer renderer-components @kind data */
import type { ComponentUsage } from '@drizztdourden08/tessera';

const usage = {
  job: 'The Hookshop picture: the robot, its hookshot and the stamped bag it catches, drawn from pixel sprites at one pixel size.',
  useWhen: ['The welcome banner of the Hookshop in the desktop app and on the site.'],
  avoidWhen: [{ case: 'A small icon of the Hookshop.', use: 'Image' }],
  rules: [
    'Set pixelSize to the screen pixels of one sprite pixel; the default is 4.',
    'Size the picture with className, never with inline styles.',
  ],
  a11y: ['It is one image whose label names the mascot and what it does; the sprites inside are hidden from assistive tools.'],
  buildingBlock: true,
  example: `import { HookshopHighlight } from '@rotp/design/packs';\n\nconst Welcome = () => <HookshopHighlight pixelSize={3} />;\n`,
  propsHash: '52c23ff149d4d5ad',
} satisfies ComponentUsage;

export { usage };
