/* @layer renderer-widgets @kind component */
/**
 * The music debugger: everything the game's audio is doing, live, in one place.
 *
 * Three sections answer three different questions. LIVE is the engine's own state — every session
 * channel with the studio's meters, progress, loops, waits and fades included. COUNTS turns the
 * feed into rates, which is what makes a probability layer testable: authored odds against
 * measured odds, on one line. EVENTS is the feed of raises and rolls, each tagged MSU / CHIP /
 * SKIP, so a stray sound names the exact id and owner.
 *
 * Mounting the widget arms the core-side traces; closing it disarms them. While armed the traces
 * are purely observational — nothing about what actually plays changes.
 */
import { Box, Button, EmptyState, SectionHeader } from '@ds/primitives';
import { useLiveChannels } from './behavior/useLiveChannels';
import { useMusicDebugData } from './behavior/useMusicDebugData';
import { ChannelLive } from './sub-components/ChannelLive';
import { CounterTable } from './sub-components/CounterTable';
import { EventFeed } from './sub-components/EventFeed';
import './MusicWidget.css';

const MusicWidgetContent = () => {
  const { channels, sessionActive } = useLiveChannels();
  const { events, counters, clear } = useMusicDebugData();

  return (
    <Box className="music-widget">
      <Box className="music-widget__section">
        <SectionHeader title="Replacement audio" subtitle="What the pack's engine is playing right now" />
        {sessionActive
          ? channels.map((channel) => <ChannelLive key={channel.name} channel={channel} />)
          : <EmptyState message="No music pack session — the sound chip owns everything." />}
      </Box>

      <Box className="music-widget__section">
        <SectionHeader
          title="Counts"
          subtitle="Raises per sound, and rolls per chance layer"
          action={<Button variant="ghost" size="sm" onClick={clear}>Clear</Button>}
        />
        <CounterTable counters={counters} />
      </Box>

      <Box className="music-widget__section music-widget__section--feed">
        <SectionHeader title="Events" subtitle="Every raise the core reported, and every roll the engine decided" />
        <EventFeed events={events} />
      </Box>
    </Box>
  );
};

export { MusicWidgetContent };
