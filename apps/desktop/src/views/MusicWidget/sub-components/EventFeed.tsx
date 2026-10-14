/* @layer renderer-widgets @kind component */
import { useEffect, useRef } from 'react';
import { Status, Box, EmptyState, ScrollArea, Text } from '@drizztdourden08/tessera/primitives';
import type { MusicDebugEvent } from '@rotp/msu';
import { OWNER_LABELS, OWNER_VARIANTS } from '../MusicWidget.constants';

const timeOf = (at: number): string => {
  const date = new Date(at);
  const pad = (value: number): string => String(value).padStart(2, '0');
  return `${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
};

const EventFeed = (props: { events: MusicDebugEvent[] }) => {
  const { events } = props;
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ block: 'nearest' });
  }, [events]);

  if (events.length === 0) return <EmptyState message="No sound events yet. Play, or make some noise." />;

  return (
    <ScrollArea className="music-widget__rows music-widget__feed">
      {events.map((event) => (
        <Box key={event.id} className="music-event">
          <Text tone="faint" className="music-event__time">{timeOf(event.at)}</Text>
          <Status tone={OWNER_VARIANTS[event.owner]}>{OWNER_LABELS[event.owner]}</Status>
          <Text className="music-event__channel">{event.channel}</Text>
          <Text className="music-event__detail">{event.detail}</Text>
        </Box>
      ))}
      <Box ref={bottomRef} />
    </ScrollArea>
  );
};

export { EventFeed };
