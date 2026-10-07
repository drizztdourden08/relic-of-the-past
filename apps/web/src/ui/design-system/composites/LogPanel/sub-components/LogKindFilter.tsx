/* @layer renderer-components @kind component */
/** Dropdown of checkboxes to show/hide each log row type. */
import { useState } from 'react';
import { Box, Button, Checkbox } from '../../../primitives';
import type { LogKindDef } from '../LogPanel.type';

interface LogKindFilterProps {
  kinds: readonly LogKindDef[];
  hidden: ReadonlySet<string>;
  onToggle: (kind: string) => void;
}

const LogKindFilter = (props: LogKindFilterProps) => {
  const { kinds, hidden, onToggle } = props;
  const [open, setOpen] = useState(false);

  return (
    <Box className="log-panel__filter">
      <Button variant="tertiary" size="sm" onClick={() => setOpen((o) => !o)}>
        Show types ▾
      </Button>
      {open && (
        <Box className="log-panel__filter-panel">
          {kinds.map((kind) => (
            <Checkbox
              key={kind.id}
              className="log-panel__filter-row"
              checked={!hidden.has(kind.id)}
              onChange={() => onToggle(kind.id)}
              label={kind.label}
            />
          ))}
        </Box>
      )}
    </Box>
  );
};

export { LogKindFilter };
export type { LogKindFilterProps };
