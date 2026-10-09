/* @layer renderer-widgets @kind component */
import { Status, Box, StatRow } from '@drizztdourden08/tessera/primitives';
import { PreviewReadout } from '@app/views/DataManager/sub-components/msu/PreviewReadout';
import { usePreviewReport } from '@app/views/DataManager/sub-components/msu/behavior/usePreviewReport';
import type { LiveChannel } from '../music.type';

const ChannelLive = (props: { channel: LiveChannel }) => {
  const { channel } = props;
  const report = usePreviewReport(channel.store, channel.name);

  if (report === null) {
    return (
      <Box className="music-widget__rows">
        <StatRow label={channel.title} value={<Status tone="neutral">silent</Status>} />
      </Box>
    );
  }

  return <PreviewReadout store={channel.store} previewKey={channel.name} label={channel.title} />;
};

export { ChannelLive };
