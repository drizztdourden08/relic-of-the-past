/* @layer renderer-app @kind component */
import { Icon, IconButton, Tooltip } from '@drizztdourden08/tessera/primitives';
import type { HelpTipProps } from './HelpTip.type';

const HelpTip = (props: HelpTipProps) => {
  const { label, children } = props;

  return (
    <Tooltip content={children} placement="bottom">
      <IconButton variant="ghost" size="xs" label={label}>
        <Icon name="circle-help" />
      </IconButton>
    </Tooltip>
  );
};

export { HelpTip };
