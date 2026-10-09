/* @layer renderer-components @kind logic */
import { Fragment } from 'react';
import { Icon as IconifyIcon } from '@iconify/react/offline';
import { Box } from '@ds/primitives/Box';
import { Button } from '@ds/primitives/Button';
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
        <Button
          variant="bare"
          className="hud-toolbar__button"
          aria-label={action.label}
          title={action.label}
          data-action={action.key}
          disabled={action.disabled}
          onClick={action.disabled ? undefined : action.run}
        >
          {action.icon && <IconifyIcon icon={action.icon} width={16} height={16} aria-hidden />}
        </Button>
      </Fragment>,
    );
  }
  return out;
};

export { renderRows };
