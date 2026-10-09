/* @layer renderer-widgets @kind component */
import { useState } from 'react';
import { Box, Text, Button } from '@ds/primitives';
import { LogDialog } from './LogDialog';
import type { EventLogProps } from '../SimulatorWidget.type';

const EventLog = (props: EventLogProps) => {
  const { events } = props;
  const [open, setOpen] = useState(false);

  return (
    <Box className="simulator__log">
      <Button
        variant="secondary"
        size="sm"
        className="simulator__log-open"
        onClick={() => setOpen(true)}
        disabled={events.length === 0}
      >
        ⤢ Open log
        <Text className="simulator__log-count">{events.length}</Text>
      </Button>
      <LogDialog open={open} onClose={() => setOpen(false)} events={events} />
    </Box>
  );
};

export { EventLog };
