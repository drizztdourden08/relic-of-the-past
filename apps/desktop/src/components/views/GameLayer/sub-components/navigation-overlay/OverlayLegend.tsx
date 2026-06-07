/* @layer renderer-components @kind component */
const OverlayLegend = () => {
  return (
    <div style={{
      position: 'absolute', bottom: 6, right: 6, zIndex: 7,
      background: 'rgba(10,10,20,0.85)', border: '1px solid rgba(100,200,255,0.2)',
      borderRadius: 4, padding: '4px 8px', pointerEvents: 'none',
      fontFamily: 'monospace', fontSize: 10, lineHeight: '15px',
      display: 'flex', flexDirection: 'column', gap: 2,
    }}>
      <LegendItem color="rgba(80,200,255,0.8)" label="reachable (free)" />
      <LegendItem color="rgba(255,100,180,0.8)" label="reachable (needs item)" />
      <LegendItem color="#cc5555" label="cliff jump" isArrow />
      <LegendItem color="#aa44ff" label="stairs (bidirectional)" isArrow />
      <LegendItem color="rgba(80,200,255,0.8)" border="#00ff88" label="hookshot target" />
    </div>
  );
};

const LegendItem = ({ color, label, border, isArrow }: { color: string; label: string; border?: string; isArrow?: boolean }) => {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
      {isArrow ? (
        <span style={{ color, fontSize: 12 }}>→</span>
      ) : (
        <span style={{
          width: 8, height: 8, borderRadius: '50%', background: color,
          border: border ? `2px solid ${border}` : 'none',
          boxSizing: 'border-box', flexShrink: 0,
        }} />
      )}
      <span style={{ color: '#ccc' }}>{label}</span>
    </div>
  );
};

export { OverlayLegend };
