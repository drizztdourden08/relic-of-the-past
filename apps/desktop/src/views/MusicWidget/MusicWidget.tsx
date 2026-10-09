/* @layer renderer-widgets @kind component */
import { Box, Button, EmptyState, SectionHeader } from '@drizztdourden08/tessera/primitives';
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
          : <EmptyState message="No music pack session. The sound chip owns everything." />}
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
