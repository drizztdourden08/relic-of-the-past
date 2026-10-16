/* @layer renderer-app @kind data */
import type { ComponentUsage } from '@drizztdourden08/tessera';

const usage = {
  job: 'The screenshot of a save, framed, with pixels kept sharp; empty when there is none.',
  useWhen: ['In the icon of a save row.'],
  avoidWhen: [{ case: 'A picture that is not a save screenshot.', use: 'Image' }],
  rules: ['Pass the screenshot URL, or null when the save has none.'],
  a11y: ['It is decorative: the row carries the name.'],
  buildingBlock: true,
  example: `import { SaveRowThumb } from '@app/compounds/SaveRowThumb';

const Mounted = () => <SaveRowThumb src={null} />;
`,
  propsHash: '0000000000000000',
} satisfies ComponentUsage;

export { usage };
