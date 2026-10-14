/* @layer renderer-app @kind data */
import type { ComponentUsage } from '@drizztdourden08/tessera';

const usage = {
  job: 'A line that says which name a bug report goes out under.',
  useWhen: ['Above the send button of a bug report.'],
  avoidWhen: [{ case: 'A line of text.', use: 'Text' }],
  rules: ['Pass null for the handle when the player has none.'],
  a11y: ['The line is plain text.'],
  buildingBlock: true,
  example: `import { ReportingAsLine } from '@app/compounds/ReportingAsLine';

const Mounted = () => <ReportingAsLine displayName="Link" githubHandle={null} />;
`,
  propsHash: 'e7a5b21b15bde0be',
} satisfies ComponentUsage;

export { usage };
