/* @layer renderer-widgets @kind component */
/**
 * Log entry point. The widget container is far too narrow to read a log in, so
 * there is no inline preview: just a button (with the live event count) that
 * opens the full log dialog.
 */
import { useState } from 'react';
import { Box, Text, Button } from '@ds/primitives';
import type { SimEvent } from '@shared/game/simulation';
import { LogDialog } from './LogDialog';

interface EventLogProps {
  events: SimEvent[];
}

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
