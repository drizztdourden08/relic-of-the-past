/* @layer site-kit @kind data */
import type { ComponentUsage } from '@drizztdourden08/tessera';

const usage = {
  job: 'The tags of an item as a wrapping row of chips, or a dash when there are none.',
  useWhen: ['A listing or a detail pane that shows the tags an author gave an item.'],
  avoidWhen: [{ case: 'Tags the person edits.', use: 'TagInput' }],
  rules: ['Pass the tag texts; each text must be unique in the list.'],
  a11y: ['Each tag is text; the dash for no tags is text too.'],
  buildingBlock: true,
  example: `import { TagList } from '@rotp/design';\n\nconst Tags = () => <TagList tags={['orchestral', 'overworld']} />;\n`,
  propsHash: '220880d46d123260',
} satisfies ComponentUsage;

export { usage };
