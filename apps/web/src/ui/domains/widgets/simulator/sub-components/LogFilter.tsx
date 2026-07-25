/* @layer renderer-widgets @kind component */
/** Dropdown of checkboxes to show/hide each log event type. */
import { useState } from 'react';
import { Box, Button, Checkbox } from '@ds/primitives';
import { ALL_KINDS, KIND_LABEL } from './log-event-style';
import type { LogKind } from './log-event-style';

interface LogFilterProps {
  hidden: Set<LogKind>;
  onToggle: (kind: LogKind) => void;
}

const LogFilter = (props: LogFilterProps) => {
  const { hidden, onToggle } = props;
  const [open, setOpen] = useState(false);

  return (
    <Box className="log-filter">
      <Button variant="tertiary" size="sm" onClick={() => setOpen((o) => !o)}>
        Show types ▾
      </Button>
      {open && (
        <Box className="log-filter__panel">
          {ALL_KINDS.map((kind) => (
            <Checkbox
              key={kind}
              className="log-filter__row"
              checked={!hidden.has(kind)}
              onChange={() => onToggle(kind)}
              label={KIND_LABEL[kind]}
            />
          ))}
        </Box>
      )}
    </Box>
  );
};

export { LogFilter };
