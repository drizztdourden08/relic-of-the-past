/* @layer renderer-components @kind data */
import type { ComponentUsage } from '@drizztdourden08/tessera';

const usage = {
  job: 'A look inside a pack file by kind: the tracks of a music pack, the sprite sheet of a character pack or the entries of a language pack.',
  useWhen: ['A review or detail page that lets a person inspect a pack before it is installed.'],
  avoidWhen: [{ case: 'The facts of a pack, such as its size and author.', use: 'StatRow' }],
  rules: [
    'Pass the kind of the item and a pack source that can read byte ranges of the file.',
    'It reads the pack itself and shows an error line when the file cannot be read.',
  ],
  a11y: ['Each kind draws its own labelled controls; errors are announced as status text.'],
  buildingBlock: true,
  example: `import { PackContents } from '@rotp/design/packs';\nimport type { PackSource } from '@rotp/design/packs';\n\nconst Inside = ({ source }: { source: PackSource }) => <PackContents kind="music" source={source} />;\n`,
  propsHash: '3ee6547e97855a00',
} satisfies ComponentUsage;

export { usage };
