/* @layer renderer-components @kind logic */
import { createElement } from 'react';
import { Button } from '@drizztdourden08/tessera/primitives';
import type { ToolGroup } from '@drizztdourden08/tessera/primitives';
import type { StudioAction, StudioActionGroup } from '../../studio-action.type';

const toButton = (action: StudioAction) => createElement(Button, {
  key: action.id,
  size: 'sm',
  variant: action.variant ?? 'secondary',
  disabled: action.disabled,
  onClick: () => { void action.onSelect(); },
}, action.label);

const toToolGroups = (groups: readonly StudioActionGroup[]): ToolGroup[] =>
  groups.map((group) => ({ id: group.id, label: group.label, content: group.actions.map(toButton) }));

export { toToolGroups };
