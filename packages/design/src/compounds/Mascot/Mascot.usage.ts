/* @layer renderer-components @kind data */
import type { ComponentUsage } from '@drizztdourden08/tessera';

const usage = {
  job: 'The Hookshop robot: a body, a visor, an eye and two pods, laid out from pixel sprites, with the eye looking toward a point.',
  useWhen: ['Inside HookshopHighlight, or beside a message the robot speaks.'],
  avoidWhen: [{ case: 'A flat picture file.', use: 'Image' }],
  rules: [
    'It fills its parent; set --px on a parent to the screen pixels of one sprite pixel.',
    'Pass look as the offset of the eye and podAngles as the angle of each pod in degrees.',
  ],
  a11y: ['It is decoration and is hidden from assistive tools.'],
  buildingBlock: true,
  example: `import { Mascot } from '@rotp/design/packs';\n\nconst Robot = () => <Mascot look={[1, 0]} podAngles={{ left: -10, right: 10 }} />;\n`,
  propsHash: '8bcee43cf6a7cfb3',
} satisfies ComponentUsage;

export { usage };
