/* @layer renderer-components @kind data */
import { Box } from '../../../../../../../design-system/primitives/Box';
import { Text } from '../../../../../../../design-system/primitives/Text';
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
    <Box style={{
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
      <Box style={{ display: 'flex', justifyContent: 'space-between', gap: 12 }}>
        <Text style={{ color: '#888' }}>[{tooltip.row},{tooltip.col}]</Text>
        <Text style={{ color: tooltip.reachable === 1 ? '#4f8' : tooltip.reachable >= 2 ? '#fc0' : '#f66', fontWeight: 'bold' }}>
          {tooltip.reachable === 1 ? '✓ reachable' : tooltip.reachable >= 2 ? '➔ traversal' : '✗ blocked'}
        </Text>
      </Box>

      {mode === 'dual' && tooltip.layer0Attr !== undefined && renderDualLayer(tooltip, ctx0)}
      {mode === 'locked' && tooltip.layer0Attr !== undefined && renderLockedLayer(tooltip, ctx0, result)}
      {mode === 'single' && renderSingleLayer(tooltip)}

      {tooltip.reachable !== 0 && (
        <Box style={{ display: 'flex', gap: 8, alignItems: 'baseline' }}>
          <Text style={{ color: '#aaa' }}>path reqs:</Text>
          <Text style={{ color: tooltip.pathReqs ? '#ff9944' : '#888' }}>
            {tooltip.pathReqs || 'none'}
          </Text>
        </Box>
      )}
      <Box style={{ display: 'flex', gap: 8, alignItems: 'baseline' }}>
        <Text style={{ color: '#aaa' }}>live sprites:</Text>
        <Text style={{ color: '#888' }}>{tooltip.spriteInfo.length}</Text>
      </Box>
      <Box style={{ display: 'flex', gap: 8, alignItems: 'baseline' }}>
        <Text style={{ color: '#aaa' }}>Blocked In Last Flood Fill:</Text>
        <Text style={{ color: tooltip.bfsBlocked ? '#ff7777' : '#888' }}>
          {tooltip.bfsBlocked ? 'yes' : 'no'}
        </Text>
      </Box>
      {tooltip.spriteInfo.length > 0 && tooltip.spriteInfo.map((line, i) => (
        <Box key={i} style={{ color: '#ffcc66' }}>{line}</Box>
      ))}
    </Box>
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
    <Box style={{ display: 'flex', gap: 0 }}>
      <Box style={{ flex: 1, borderRight: '1px solid rgba(255,255,255,0.15)', paddingRight: 6, display: 'flex', flexDirection: 'column', gap: 1 }}>
        <Box style={{ color: '#66ccff', fontWeight: 'bold', fontSize: 10 }}>▼ GROUND</Box>
        <Box><Text style={{ color: '#6cf' }}>0x{a1.toString(16).padStart(2, '0')}</Text> <Text style={{ color: '#fff' }}>{lbl1}</Text></Box>
        <Box><Text style={{ color: '#aaa' }}>type:</Text> <Text style={{ color: '#fc6' }}>{cls1.type === 'ledge' ? `ledge (${cls1.dir})` : cls1.type}</Text></Box>
        {def1?.req && <Box><Text style={{ color: '#aaa' }}>req:</Text> <Text style={{ color: '#fc6' }}>{def1.req}</Text></Box>}
        <Box style={{ color: l1Reach ? '#4f8' : '#f66', fontWeight: 'bold' }}>
          {l1Reach ? '✓ reachable' : '✗ wall'}
        </Box>
      </Box>
      <Box style={{ flex: 1, paddingLeft: 6, display: 'flex', flexDirection: 'column', gap: 1 }}>
        <Box style={{ color: '#ff9966', fontWeight: 'bold', fontSize: 10 }}>▲ ABOVE</Box>
        <Box><Text style={{ color: '#6cf' }}>0x{a0.toString(16).padStart(2, '0')}</Text> <Text style={{ color: '#fff' }}>{lbl0}</Text></Box>
        <Box><Text style={{ color: '#aaa' }}>type:</Text> <Text style={{ color: '#fc6' }}>{cls0.type === 'ledge' ? `ledge (${cls0.dir})` : cls0.type}</Text></Box>
        {def0?.req && <Box><Text style={{ color: '#aaa' }}>req:</Text> <Text style={{ color: '#fc6' }}>{def0.req}</Text></Box>}
        <Box style={{ color: l0Reach ? '#4f8' : '#f66', fontWeight: 'bold' }}>
          {l0Reach ? '✓ reachable' : '✗ wall'}
        </Box>
      </Box>
    </Box>
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
    <Box style={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
      <Box style={{ color: layerColor, fontWeight: 'bold', fontSize: 10 }}>
        {layerLabel} <Text style={{ color: '#f88', fontSize: 9 }}>LAYER LOCKED</Text>
      </Box>
      <Box><Text style={{ color: '#6cf' }}>0x{attr.toString(16).padStart(2, '0')}</Text> <Text style={{ color: '#fff' }}>{lbl}</Text></Box>
      <Box><Text style={{ color: '#aaa' }}>type:</Text> <Text style={{ color: '#fc6' }}>{cls.type === 'ledge' ? `ledge (${cls.dir})` : cls.type}</Text></Box>
      {def?.req && <Box><Text style={{ color: '#aaa' }}>req:</Text> <Text style={{ color: '#fc6' }}>{def.req}</Text></Box>}
      <Box style={{ color: reach ? '#4f8' : '#f66', fontWeight: 'bold' }}>
        {reach ? '✓ reachable' : '✗ wall'}
      </Box>
    </Box>
  );
};

const renderSingleLayer = (tooltip: TooltipData) => {
  return (
    <>
      <Box style={{ display: 'flex', gap: 8, alignItems: 'baseline' }}>
        <Text style={{ color: '#6cf' }}>0x{tooltip.attr.toString(16).padStart(2, '0')}</Text>
        <Text style={{ color: '#fff' }}>{tooltip.label}</Text>
      </Box>
      <Box style={{ display: 'flex', gap: 8, alignItems: 'baseline' }}>
        <Text style={{ color: '#aaa' }}>type:</Text>
        <Text style={{ color: '#fc6' }}>{tooltip.type}</Text>
        {tooltip.req && <>
          <Text style={{ color: '#aaa' }}>req:</Text>
          <Text style={{ color: tooltip.canPass ? '#4f8' : '#f66' }}>
            {tooltip.req} {tooltip.canPass ? '✓' : '✗'}
          </Text>
        </>}
        {tooltip.hookTarget && (
          <Text style={{ color: '#00ff88', fontWeight: 'bold' }}>⎆ hookshottable</Text>
        )}
      </Box>
    </>
  );
};

export { TileTooltipContent };
export type { TooltipData };
