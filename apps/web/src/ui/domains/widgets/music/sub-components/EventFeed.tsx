/* @layer renderer-widgets @kind component */
/**
 * The rolling feed: every raise the core reported and every roll the engine decided, newest at
 * the bottom, each line tagged with who produced it. This is the ground truth for "what just
 * made that sound". A CHIP line during a storm names the exact id to claim.
 */
import { useEffect, useRef } from 'react';
import { Badge, Box, EmptyState, ScrollArea, Text } from '@ds/primitives';
import type { BadgeVariant } from '@ds/primitives/Badge/Badge.type';
import type { MusicDebugEvent, MusicDebugOwner } from '@app/lib/game/music-debug';

const OWNER_LABELS: Record<MusicDebugOwner, string> = { pack: 'MSU', chip: 'CHIP', skipped: 'SKIP' };
const OWNER_VARIANTS: Record<MusicDebugOwner, BadgeVariant> = {
  pack: 'success', chip: 'warning', skipped: 'neutral',
};

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
          <Text className="music-event__time">{timeOf(event.at)}</Text>
          <Badge variant={OWNER_VARIANTS[event.owner]}>{OWNER_LABELS[event.owner]}</Badge>
          <Text className="music-event__channel">{event.channel}</Text>
          <Text className="music-event__detail">{event.detail}</Text>
        </Box>
      ))}
      <Box ref={bottomRef} />
    </ScrollArea>
  );
};

export { EventFeed };
