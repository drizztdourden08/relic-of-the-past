/* @layer renderer-widgets @kind component */
import { Box, Text } from '@drizztdourden08/tessera/primitives';
import { clock } from '@rotp/design/packs';
import { usePreviewReport } from '@app/msu-studio/behavior/usePreviewReport';
import { LAYER_SLOTS, NONE } from '../MusicWidget.constants';
import { layerSlots } from '../behavior/layer-slot';
import type { LiveChannel } from '../MusicWidget.type';
import { LayerSlot } from './LayerSlot';
import './ChannelLive.css';

const ChannelLive = (props: { channel: LiveChannel }) => {
  const { channel } = props;
  const report = usePreviewReport(channel.store, channel.name);
  const slots = layerSlots(report?.layers ?? [], LAYER_SLOTS[channel.name]);

  return (
    <Box className="channel-live" data-silent={report === null ? 'yes' : 'no'}>
      <Box className="channel-live__head">
        <Text className="channel-live__title">{channel.title}</Text>
        <Text className="channel-live__detail">{report === null ? 'silent' : (report.detail ?? NONE)}</Text>
        <Text className="channel-live__clock">{report === null ? NONE : clock(report.elapsedSeconds)}</Text>
      </Box>
      {slots.map((slot, index) => <LayerSlot key={index} slot={slot} />)}
    </Box>
  );
};

export { ChannelLive };
