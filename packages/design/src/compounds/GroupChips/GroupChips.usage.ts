/* @layer site-kit @kind data */
import type { ComponentUsage } from '@drizztdourden08/tessera';

const usage = {
  job: 'The groups of a person as chips, each marked when the group was given by hand or came from a Discord role.',
  useWhen: ['An account page or an admin row that shows which groups a person belongs to.'],
  avoidWhen: [{ case: 'A plain list of tags with no origin.', use: 'Tag' }],
  rules: [
    'Pass the groups, the ids given by hand and the ids given by a Discord role.',
    'Set empty when the line should say something other than no group.',
  ],
  a11y: ['Each chip is text, and the origin marks are text as well.'],
  buildingBlock: true,
  example: `import { GroupChips } from '@rotp/design';\n\nconst GroupsSample = () => <GroupChips groups={[{ id: 'artists', name: 'Artists' }]} manualIds={['artists']} roleIds={[]} />;\n`,
  propsHash: 'd0829551bc749a69',
} satisfies ComponentUsage;

export { usage };
