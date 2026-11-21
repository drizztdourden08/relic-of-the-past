/* @layer renderer-app @kind data */
import type { ComponentUsage } from '@drizztdourden08/tessera';

const usage = {
  job: 'The touch board a player taps to bind a touch control to an action, with cancel and default buttons.',
  useWhen: ['As the listener of the input settings when the active profile is a touch profile.'],
  avoidWhen: [{ case: 'Picking a key or a pad button.', use: 'Button' }],
  rules: ['Pass the listener context and the label of the action being bound; it renders nothing for a profile that is not touch.'],
  a11y: ['Each choice on the board is a button with its own label.'],
  buildingBlock: true,
  example: `import type { ComponentProps } from 'react';\nimport { TouchBindPicker } from '@app/views/TouchBindPicker';\n\nconst Mounted = (props: ComponentProps<typeof TouchBindPicker>) => <TouchBindPicker {...props} />;\n`,
  propsHash: '628baaddcf5cb5f9',
} satisfies ComponentUsage;

export { usage };
