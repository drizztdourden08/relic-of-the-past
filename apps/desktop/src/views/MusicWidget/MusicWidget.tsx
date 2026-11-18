/* @layer renderer-widgets @kind component */
import { useT } from '@drizztdourden08/brock-react';
import { Box, Button, SectionHeader, Status } from '@drizztdourden08/tessera/primitives';
import { useLiveChannels } from './behavior/useLiveChannels';
import { useMusicDebugData } from './behavior/useMusicDebugData';
import { ChannelLive } from './sub-components/ChannelLive';
import { CounterTable } from './sub-components/CounterTable';
import { EventFeed } from './sub-components/EventFeed';
import './MusicWidget.css';

const MusicWidgetContent = () => {
  const t = useT();
  const { channels, sessionActive } = useLiveChannels();
  const { events, counters, clear } = useMusicDebugData();

  return (
    <Box className="music-widget" data-session={sessionActive ? 'active' : 'none'}>
      <Box className="music-widget__section">
        <SectionHeader
          title={t('views-music:section.audio')}
          action={<Status tone={sessionActive ? 'success' : 'neutral'}>{sessionActive ? t('views-music:status.pack') : t('views-music:status.none')}</Status>}
        />
        {channels.map((channel) => <ChannelLive key={channel.name} channel={channel} />)}
      </Box>

      <Box className="music-widget__section">
        <SectionHeader
          title={t('views-music:section.counts')}
          action={<Button variant="ghost" size="sm" onClick={clear}>{t('views-music:counts.clear')}</Button>}
        />
        <CounterTable counters={counters} />
      </Box>

      <Box className="music-widget__section music-widget__section--feed">
        <SectionHeader title={t('views-music:section.events')} />
        <EventFeed events={events} />
      </Box>
    </Box>
  );
};

export { MusicWidgetContent };
