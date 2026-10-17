/* @layer renderer-app @kind data */
import type { ComponentUsage } from '@drizztdourden08/tessera';

const usage = {
  job: 'A save action that a first click arms and a second click runs: Load, Save or Delete.',
  useWhen: ['In a quick save slot, and in the rows of the Saves and Auto-saves lists.'],
  avoidWhen: [{ case: 'An action that runs on one click.', use: 'Button' }],
  rules: [
    'Share one useArmedAction between the buttons of a slot or a row, so arming one disarms the other.',
    'Pass caption to show the action as text; an armed button asks it as a question.',
  ],
  a11y: ['The button names its action; an armed button says it waits for a second click.'],
  buildingBlock: true,
  example: `import { ArmedActionButton, useArmedAction } from '@app/compounds/ArmedActionButton';

const Mounted = () => {
  const { armed, press, disarm } = useArmedAction({ resetKey: 'save-1' });
  return (
    <ArmedActionButton
      action="load"
      label="Load save 1"
      caption="Load"
      armed={armed === 'load'}
      onPress={() => press('load', () => undefined)}
      onDisarm={disarm}
    />
  );
};
`,
  propsHash: 'be3c51b30e3b06a0',
} satisfies ComponentUsage;

export { usage };
