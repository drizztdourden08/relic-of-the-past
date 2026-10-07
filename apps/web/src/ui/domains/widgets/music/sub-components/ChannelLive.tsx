/* @layer renderer-widgets @kind component */
/**
 * One channel's live block: the studio's own meter readout when something is sounding, a named
 * "silent" row when nothing is. The silent row matters here in a way it does not in the studio,
 * because a debugger's question is as often "why is this channel NOT playing" as what it is playing.
 */
import { Badge, Box, StatRow } from '@ds/primitives';
import { PreviewReadout } from '@domains/app/views/DataManager/sub-components/msu/PreviewReadout';
import { usePreviewReport } from '@domains/app/views/DataManager/sub-components/msu/behavior/usePreviewReport';
import type { LiveChannel } from '../behavior/useLiveChannels';

const ChannelLive = (props: { channel: LiveChannel }) => {
  const { channel } = props;
  const report = usePreviewReport(channel.store, channel.name);

  if (report === null) {
    return (
      <Box className="music-widget__rows">
        <StatRow label={channel.title} value={<Badge variant="neutral">silent</Badge>} />
      </Box>
    );
  }

  return <PreviewReadout store={channel.store} previewKey={channel.name} label={channel.title} />;
};

export { ChannelLive };
