import { classifyTileAttr } from '@shared/game/navigation/tile-classification';
import { getTileAttrsMap, getAttrLabel } from '@shared/game/navigation/tile-attrs';
import type { FloodFillResult } from '@shared/game/navigation';
import type { TileAttrContext } from '@shared/game/navigation/tile-attrs';
import { getLayerDisplayMode, getLockedLayer } from './layer-display';

interface TooltipData {
  x: number; y: number;
  row: number; col: number;
  attr: number; label: string;
  type: string; req: string | null;
  canPass: boolean | null;
  reachable: number;
  hookTarget: boolean;
  pathReqs: string;
  bfsBlocked: boolean;
  spriteInfo: string[];
  layer0Attr?: number;
  layer1Attr?: number;
  layer0Reach?: boolean;
  layer1Reach?: boolean;
}

interface TileTooltipContentProps {
  tooltip: TooltipData;
  result: FloodFillResult;
}

const TileTooltipContent = ({ tooltip, result }: TileTooltipContentProps) => {
  const ctx0 = result.tileContext ?? 'overworld';
  const mode = getLayerDisplayMode(result);

  return (
    <div style={{
      position: 'absolute',
      left: tooltip.x,
      top: tooltip.y,
      background: 'rgba(10,10,20,0.92)',
      border: '1px solid rgba(100,200,255,0.3)',
      borderRadius: 4,
      padding: '5px 8px',
      pointerEvents: 'none',
      whiteSpace: 'normal',
      maxWidth: 760,
      fontFamily: 'monospace',
      fontSize: 11,
      lineHeight: '16px',
      display: 'flex',
      flexDirection: 'column',
      gap: 2,
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12 }}>
        <span style={{ color: '#888' }}>[{tooltip.row},{tooltip.col}]</span>
        <span style={{ color: tooltip.reachable === 1 ? '#4f8' : tooltip.reachable >= 2 ? '#fc0' : '#f66', fontWeight: 'bold' }}>
          {tooltip.reachable === 1 ? '✓ reachable' : tooltip.reachable >= 2 ? '➔ traversal' : '✗ blocked'}
        </span>
      </div>

      {mode === 'dual' && tooltip.layer0Attr !== undefined && renderDualLayer(tooltip, ctx0)}
      {mode === 'locked' && tooltip.layer0Attr !== undefined && renderLockedLayer(tooltip, ctx0, result)}
      {mode === 'single' && renderSingleLayer(tooltip)}

      {tooltip.reachable !== 0 && (
        <div style={{ display: 'flex', gap: 8, alignItems: 'baseline' }}>
          <span style={{ color: '#aaa' }}>path reqs:</span>
          <span style={{ color: tooltip.pathReqs ? '#ff9944' : '#888' }}>
            {tooltip.pathReqs || 'none'}
          </span>
        </div>
      )}
      <div style={{ display: 'flex', gap: 8, alignItems: 'baseline' }}>
        <span style={{ color: '#aaa' }}>live sprites:</span>
        <span style={{ color: '#888' }}>{tooltip.spriteInfo.length}</span>
      </div>
      <div style={{ display: 'flex', gap: 8, alignItems: 'baseline' }}>
        <span style={{ color: '#aaa' }}>Blocked In Last Flood Fill:</span>
        <span style={{ color: tooltip.bfsBlocked ? '#ff7777' : '#888' }}>
          {tooltip.bfsBlocked ? 'yes' : 'no'}
        </span>
      </div>
      {tooltip.spriteInfo.length > 0 && tooltip.spriteInfo.map((line, i) => (
        <div key={i} style={{ color: '#ffcc66' }}>{line}</div>
      ))}
    </div>
  );
};

const renderDualLayer = (tooltip: TooltipData, ctx0: TileAttrContext) => {
  const a0 = tooltip.layer0Attr!;
  const a1 = tooltip.layer1Attr ?? 0;
  const l0HasContent = a0 !== 0x00 || !!tooltip.layer0Reach;
  const l1HasContent = a1 !== 0x00 || !!tooltip.layer1Reach;
  if (!l0HasContent || !l1HasContent) return renderSingleLayer(tooltip);

  const cls0 = classifyTileAttr(a0, ctx0);
  const cls1 = classifyTileAttr(a1, ctx0);
  const lbl0 = getAttrLabel(a0, ctx0);
  const lbl1 = getAttrLabel(a1, ctx0);
  const def0 = getTileAttrsMap(ctx0)[a0];
  const def1 = getTileAttrsMap(ctx0)[a1];
  const l0Reach = tooltip.layer0Reach;
  const l1Reach = tooltip.layer1Reach;

  return (
    <div style={{ display: 'flex', gap: 0 }}>
      <div style={{ flex: 1, borderRight: '1px solid rgba(255,255,255,0.15)', paddingRight: 6, display: 'flex', flexDirection: 'column', gap: 1 }}>
        <div style={{ color: '#66ccff', fontWeight: 'bold', fontSize: 10 }}>▼ GROUND</div>
        <div><span style={{ color: '#6cf' }}>0x{a1.toString(16).padStart(2, '0')}</span> <span style={{ color: '#fff' }}>{lbl1}</span></div>
        <div><span style={{ color: '#aaa' }}>type:</span> <span style={{ color: '#fc6' }}>{cls1.type === 'ledge' ? `ledge (${cls1.dir})` : cls1.type}</span></div>
        {def1?.req && <div><span style={{ color: '#aaa' }}>req:</span> <span style={{ color: '#fc6' }}>{def1.req}</span></div>}
        <div style={{ color: l1Reach ? '#4f8' : '#f66', fontWeight: 'bold' }}>
          {l1Reach ? '✓ reachable' : '✗ wall'}
        </div>
      </div>
      <div style={{ flex: 1, paddingLeft: 6, display: 'flex', flexDirection: 'column', gap: 1 }}>
        <div style={{ color: '#ff9966', fontWeight: 'bold', fontSize: 10 }}>▲ ABOVE</div>
        <div><span style={{ color: '#6cf' }}>0x{a0.toString(16).padStart(2, '0')}</span> <span style={{ color: '#fff' }}>{lbl0}</span></div>
        <div><span style={{ color: '#aaa' }}>type:</span> <span style={{ color: '#fc6' }}>{cls0.type === 'ledge' ? `ledge (${cls0.dir})` : cls0.type}</span></div>
        {def0?.req && <div><span style={{ color: '#aaa' }}>req:</span> <span style={{ color: '#fc6' }}>{def0.req}</span></div>}
        <div style={{ color: l0Reach ? '#4f8' : '#f66', fontWeight: 'bold' }}>
          {l0Reach ? '✓ reachable' : '✗ wall'}
        </div>
      </div>
    </div>
  );
};

const renderLockedLayer = (tooltip: TooltipData, ctx0: TileAttrContext, result: FloodFillResult) => {
  const lockedLayer = getLockedLayer(result);
  const attr = lockedLayer === 0 ? (tooltip.layer0Attr ?? tooltip.attr) : (tooltip.layer1Attr ?? tooltip.attr);
  const reach = lockedLayer === 0 ? tooltip.layer0Reach : tooltip.layer1Reach;
  const layerLabel = lockedLayer === 0 ? '▲ ABOVE' : '▼ GROUND';
  const layerColor = lockedLayer === 0 ? '#ff9966' : '#66ccff';

  const cls = classifyTileAttr(attr, ctx0);
  const lbl = getAttrLabel(attr, ctx0);
  const def = getTileAttrsMap(ctx0)[attr];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
      <div style={{ color: layerColor, fontWeight: 'bold', fontSize: 10 }}>
        {layerLabel} <span style={{ color: '#f88', fontSize: 9 }}>LAYER LOCKED</span>
      </div>
      <div><span style={{ color: '#6cf' }}>0x{attr.toString(16).padStart(2, '0')}</span> <span style={{ color: '#fff' }}>{lbl}</span></div>
      <div><span style={{ color: '#aaa' }}>type:</span> <span style={{ color: '#fc6' }}>{cls.type === 'ledge' ? `ledge (${cls.dir})` : cls.type}</span></div>
      {def?.req && <div><span style={{ color: '#aaa' }}>req:</span> <span style={{ color: '#fc6' }}>{def.req}</span></div>}
      <div style={{ color: reach ? '#4f8' : '#f66', fontWeight: 'bold' }}>
        {reach ? '✓ reachable' : '✗ wall'}
      </div>
    </div>
  );
};

const renderSingleLayer = (tooltip: TooltipData) => {
  return (
    <>
      <div style={{ display: 'flex', gap: 8, alignItems: 'baseline' }}>
        <span style={{ color: '#6cf' }}>0x{tooltip.attr.toString(16).padStart(2, '0')}</span>
        <span style={{ color: '#fff' }}>{tooltip.label}</span>
      </div>
      <div style={{ display: 'flex', gap: 8, alignItems: 'baseline' }}>
        <span style={{ color: '#aaa' }}>type:</span>
        <span style={{ color: '#fc6' }}>{tooltip.type}</span>
        {tooltip.req && <>
          <span style={{ color: '#aaa' }}>req:</span>
          <span style={{ color: tooltip.canPass ? '#4f8' : '#f66' }}>
            {tooltip.req} {tooltip.canPass ? '✓' : '✗'}
          </span>
        </>}
        {tooltip.hookTarget && (
          <span style={{ color: '#00ff88', fontWeight: 'bold' }}>⎆ hookshottable</span>
        )}
      </div>
    </>
  );
};

export { TileTooltipContent };
export type { TooltipData };
