/* @layer renderer-widgets @kind component */
import { useEffect, useRef } from 'react';
import { Status, Box, ScrollArea, Text } from '@drizztdourden08/tessera/primitives';
import { DateText } from '@drizztdourden08/tessera/composites';
import type { MusicDebugEvent } from '@rotp/msu';
import { OWNER_LABELS, OWNER_VARIANTS } from '../MusicWidget.constants';
import './EventFeed.css';

const EventFeed = (props: { events: MusicDebugEvent[] }) => {
  const { events } = props;
  const feedRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const feed = feedRef.current;
    if (feed !== null) feed.scrollTop = feed.scrollHeight;
  }, [events]);

  return (
    <ScrollArea ref={feedRef} className="event-feed" fade={false}>
      {events.length === 0 && (
        <Box className="event-feed__row" data-empty="yes">
          <Text className="event-feed__detail">No sound events yet.</Text>
        </Box>
      )}
      {events.map((event) => (
        <Box key={event.id} className="event-feed__row">
          <Text tone="faint" className="event-feed__time"><DateText value={event.at} format="time" length="medium" /></Text>
          <Box className="event-feed__owner"><Status tone={OWNER_VARIANTS[event.owner]}>{OWNER_LABELS[event.owner]}</Status></Box>
          <Text className="event-feed__channel">{event.channel}</Text>
          <Text className="event-feed__detail" title={event.detail}>{event.detail}</Text>
        </Box>
      ))}
    </ScrollArea>
  );
};

export { EventFeed };
