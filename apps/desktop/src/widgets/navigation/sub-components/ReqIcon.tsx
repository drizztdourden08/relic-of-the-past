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

/** Renders a requirement as an emoji icon (known reqs) or a labeled chip. */
const ReqIcon = ({ req }: { req: string }) => {
  const info = REQ_ICONS[req];
  if (info) {
    return <span title={req} style={{ fontSize: 12, marginRight: 2 }}>{info.icon}</span>;
  }
  return <span style={{ fontSize: 10, color: '#fc6', marginRight: 4, background: 'rgba(255,200,0,0.12)', padding: '0 3px', borderRadius: 2 }}>{req}</span>;
};

export { ReqIcon };
