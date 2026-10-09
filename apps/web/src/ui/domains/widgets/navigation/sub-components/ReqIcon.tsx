/* @layer renderer-widgets @kind component */
import { Text } from '../../../../design-system/primitives';
import { IL } from './ReqIcon.constants';

const REQ_ICONS: Record<string, { icon: string; color: string }> = {
  flippers: { icon: '🏊', color: '#48f' },
  hammer: { icon: '🔨', color: '#fa4' },
  boots: { icon: '👢', color: '#c84' },
  glove: { icon: '🧤', color: '#a8f' },
  hookshot: { icon: '🪝', color: '#8af' },
  bomb: { icon: '💣', color: '#f44' },
  firerod: { icon: '🔥', color: '#f84' },
  icerod: { icon: '❄️', color: '#4cf' },
  lamp: { icon: '🔦', color: '#fc4' },
  mirror: { icon: '🪞', color: '#c8f' },
  sword: { icon: '⚔️', color: '#aaf' },
  bow: { icon: '🏹', color: '#8c4' },
};

const ReqIcon = ({ req }: { req: string }) => {
  const info = REQ_ICONS[req];
  if (info) {
    return <Text title={req} style={IL.emoji}>{info.icon}</Text>;
  }
  return <Text style={IL.chip}>{req}</Text>;
};

export { ReqIcon };
