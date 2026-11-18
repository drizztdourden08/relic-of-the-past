/* @layer renderer-widgets @kind component */
import { useState } from 'react';
import { useT } from '@drizztdourden08/brock-react';
import { Badge, Box, Button, Icon } from '@drizztdourden08/tessera/primitives';
import { LogDialog } from './LogDialog';
import type { EventLogProps } from '../SimulatorWidget.type';

const EventLog = (props: EventLogProps) => {
  const { events } = props;
  const t = useT();
  const [open, setOpen] = useState(false);

  return (
    <Box className="simulator__log">
      <Button
        variant="secondary"
        size="sm"
        fullWidth
        icon={<Icon name="maximize-2" />}
        onClick={() => setOpen(true)}
        disabled={events.length === 0}
      >
        {t('views-simulator:log.open')}
        <Badge variant="inline" color="tame" value={events.length} max={Number.MAX_SAFE_INTEGER} />
      </Button>
      <LogDialog open={open} onClose={() => setOpen(false)} events={events} />
    </Box>
  );
};

export { EventLog };
