/* @layer renderer-widgets @kind component */
import { Text } from '@drizztdourden08/tessera/primitives';
import { REQ_ICONS } from './ReqIcon.constants';
import './ReqIcon.css';

const ReqIcon = ({ req }: { req: string }) => {
  const icon = REQ_ICONS[req];
  if (icon) {
    return <Text title={req} className="nav-req-icon">{icon}</Text>;
  }
  return <Text className="nav-req-chip">{req}</Text>;
};

export { ReqIcon };
