/* @layer renderer-components @kind logic */
import { Fragment } from 'react';
import { Box, Icon, Pressable } from '@drizztdourden08/tessera/primitives';
import type { ReactNode } from 'react';
import type { EditorAction } from '../selection-bands.type';

const renderRows = (actions: readonly EditorAction[]): ReactNode[] => {
  let lastGroup: string | undefined;
  const out: ReactNode[] = [];
  for (const action of actions) {
    if (action.kind !== 'button') continue;
    const separator = lastGroup !== undefined && action.group !== lastGroup;
    lastGroup = action.group;
    out.push(
      <Fragment key={action.key}>
        {separator && <Box className="hud-toolbar__sep" />}
        <Pressable
          className="hud-toolbar__button"
          aria-label={action.label}
          title={action.label}
          data-action={action.key}
          disabled={action.disabled}
          onClick={action.disabled ? undefined : action.run}
        >
          {action.icon && <Icon icon={action.icon} size={16} aria-hidden />}
        </Pressable>
      </Fragment>,
    );
  }
  return out;
};

export { renderRows };
