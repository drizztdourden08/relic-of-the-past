/* @layer renderer-components @kind data */
import type { ComponentUsage } from '@drizztdourden08/tessera';

const usage = {
  job: 'One picture placed and rotated on a scene by a box of left, top, width, height and angle.',
  useWhen: ['A scene that lays several pictures out by a measured box, such as the Hookshop highlight.'],
  avoidWhen: [{ case: 'A picture in the flow of a page.', use: 'Image' }],
  rules: ['Pass the box and the picture source; the part sits at its position inside its scene.'],
  a11y: ['It is decoration and carries no text.'],
  buildingBlock: true,
  example: `import { PlacedPart } from '@rotp/design';\n\nconst Bot = ({ src }: { src: string }) => <PlacedPart src={src} box={{ left: 0, top: 0, width: 1, height: 1, angle: 0, originX: 0.5, originY: 0.5 }} />;\n`,
  propsHash: 'f9eeb2f4b747976f',
} satisfies ComponentUsage;

export { usage };
