/* @layer renderer-components @kind component */
import { Icon, IconButton, Inline, Tooltip } from '@drizztdourden08/tessera/primitives';
import type { SaveRowAction, SaveRowActionsProps } from '../SaveRow.type';

const tipOf = ({ label, shortcut, disabledReason }: SaveRowAction): string =>
  disabledReason ?? (shortcut ? `${label} (${shortcut})` : label);

const SaveRowActions = ({ actions, tabIndex }: SaveRowActionsProps) => (
  <Inline gap="2xs">
    {actions.map((action) => (
      <Tooltip key={action.id} content={tipOf(action)}>
        <IconButton
          size="sm"
          variant="ghost"
          label={action.label}
          disabled={action.disabledReason !== undefined}
          tabIndex={tabIndex}
          onClick={action.onSelect}
        >
          <Icon name={action.icon} />
        </IconButton>
      </Tooltip>
    ))}
  </Inline>
);

export { SaveRowActions };
