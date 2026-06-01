export function PathControlsLegend() {
  return (
    <div style={{
      position: 'absolute', bottom: 90, right: 6, zIndex: 7,
      background: 'rgba(10,10,20,0.85)', border: '1px solid rgba(100,200,255,0.2)',
      borderRadius: 4, padding: '4px 8px', pointerEvents: 'none',
      fontFamily: 'monospace', fontSize: 10, lineHeight: '15px',
      display: 'flex', flexDirection: 'column', gap: 2,
    }}>
      <div style={{ color: '#9fd', fontWeight: 700 }}>Path Debug Controls</div>
      <div style={{ color: '#ccc' }}>LMB hold: live A* path to cursor</div>
      <div style={{ color: '#ccc' }}>RMB while holding: lock target</div>
      <div style={{ color: '#ccc' }}>Release LMB: clear lock/path</div>
      <div style={{ color: '#ffee00' }}>Shift+drag: select tiles → clipboard</div>
    </div>
  );
}
