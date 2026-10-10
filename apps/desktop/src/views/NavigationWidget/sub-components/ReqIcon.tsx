/* @layer renderer-widgets @kind component */
import { Text } from '@drizztdourden08/tessera/primitives';
import { IL, REQ_ICONS } from './ReqIcon.constants';

const ReqIcon = ({ req }: { req: string }) => {
  const info = REQ_ICONS[req];
  if (info) {
    return <Text title={req} style={IL.emoji}>{info.icon}</Text>;
  }
  return <Text style={IL.chip}>{req}</Text>;
};

export { ReqIcon };
