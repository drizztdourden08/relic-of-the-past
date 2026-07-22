/* @layer renderer-widgets @kind component */
/**
 * Narrative event feed for the current run — auto-scrolls to the newest line,
 * mirroring the Logs widget behaviour.
 */
import { useEffect, useRef } from 'react';
import { Box, Text } from '@ds/primitives';
import type { SimEvent } from '@shared/game/simulation';

interface EventLogProps {
  events: SimEvent[];
}

const EventLog = (props: EventLogProps) => {
  const { events } = props;
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [events]);

  return (
    <Box className="simulator__events">
      {events.length === 0 && <Box className="simulator__events-empty">No events yet.</Box>}
      {events.map((event, i) => (
        <Box key={`${event.step}-${i}`} className="simulator__event">
          <Text className="simulator__event-step">{event.step}</Text>
          <Text className="simulator__event-msg">{event.msg}</Text>
        </Box>
      ))}
      <Box ref={bottomRef} />
    </Box>
  );
};

export { EventLog };
