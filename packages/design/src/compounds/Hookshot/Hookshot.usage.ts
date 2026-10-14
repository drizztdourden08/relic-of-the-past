/* @layer renderer-components @kind data */
import type { ComponentUsage } from '@drizztdourden08/tessera';

const usage = {
  job: 'A hookshot drawn along a curve: the handle, a chain of links and the head, from pixel sprites.',
  useWhen: ['Inside HookshopHighlight, which supplies the curve and the pixel size.'],
  avoidWhen: [{ case: 'A flat picture file.', use: 'Image' }],
  rules: [
    'Pass the four control points of the curve, in pixel units of the scene.',
    'Pass clip to hide the part of the chain that sits behind another sprite.',
  ],
  a11y: ['It is decoration and is hidden from assistive tools.'],
  buildingBlock: true,
  example: `import { Hookshot } from '@rotp/design/packs';\n\nconst Chain = () => <Hookshot curve={[[0, 0], [10, 0], [20, 10], [30, 10]]} />;\n`,
  propsHash: 'c024025d0e95d59d',
} satisfies ComponentUsage;

export { usage };
