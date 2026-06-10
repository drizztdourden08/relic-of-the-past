/* @layer renderer-components @kind data */
import type { CSSProperties } from 'react';
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

/** Static style map — only dynamic/positioned styles stay inline. */
const S: Record<string, CSSProperties> = {
  headerRow: { display: 'flex', justifyContent: 'space-between', gap: 12 },
  row: { display: 'flex', gap: 8, alignItems: 'baseline' },
  dualRow: { display: 'flex', gap: 0 },
  dualColLeft: { flex: 1, borderRight: '1px solid var(--c-border)', paddingRight: 6, display: 'flex', flexDirection: 'column', gap: 1 },
  dualColRight: { flex: 1, paddingLeft: 6, display: 'flex', flexDirection: 'column', gap: 1 },
  col: { display: 'flex', flexDirection: 'column', gap: 1 },
  colHeadInfo: { color: 'var(--c-info)', fontWeight: 'bold', fontSize: 10 },
  colHeadGold: { color: 'var(--c-gold)', fontWeight: 'bold', fontSize: 10 },
  lockedTag: { color: 'var(--c-danger)', fontSize: 9 },
  hookable: { color: 'var(--c-green)', fontWeight: 'bold' },
  muted: { color: 'var(--c-text-muted)' },
  dim: { color: 'var(--c-text-dim)' },
  info: { color: 'var(--c-info)' },
  warning: { color: 'var(--c-warning)' },
  text: { color: 'var(--c-text)' },
};

const TileTooltipContent = ({ tooltip, result }: TileTooltipContentProps) => {
  const ctx0 = result.tileContext ?? 'overworld';
  const mode = getLayerDisplayMode(result);

  return (
    <Box style={{
      position: 'absolute',
      left: tooltip.x,
      top: tooltip.y,
      background: 'var(--c-glass)',
      border: '1px solid var(--c-border-strong)',
      borderRadius: 'var(--r-sm)',
      padding: '5px 8px',
      boxShadow: 'var(--shadow-2)',
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
      <Box style={S.headerRow}>
        <Text style={S.muted}>[{tooltip.row},{tooltip.col}]</Text>
        <Text style={{ color: tooltip.reachable === 1 ? 'var(--c-green-bright)' : tooltip.reachable >= 2 ? 'var(--c-warning)' : 'var(--c-danger)', fontWeight: 'bold' }}>
          {tooltip.reachable === 1 ? '✓ reachable' : tooltip.reachable >= 2 ? '➔ traversal' : '✗ blocked'}
        </Text>
      </Box>

      {mode === 'dual' && tooltip.layer0Attr !== undefined && renderDualLayer(tooltip, ctx0)}
      {mode === 'locked' && tooltip.layer0Attr !== undefined && renderLockedLayer(tooltip, ctx0, result)}
      {mode === 'single' && renderSingleLayer(tooltip)}

      {tooltip.reachable !== 0 && (
        <Box style={S.row}>
          <Text style={S.dim}>path reqs:</Text>
          <Text style={{ color: tooltip.pathReqs ? 'var(--c-gold)' : 'var(--c-text-muted)' }}>
            {tooltip.pathReqs || 'none'}
          </Text>
        </Box>
      )}
      <Box style={S.row}>
        <Text style={S.dim}>live sprites:</Text>
        <Text style={S.muted}>{tooltip.spriteInfo.length}</Text>
      </Box>
      <Box style={S.row}>
        <Text style={S.dim}>Blocked In Last Flood Fill:</Text>
        <Text style={{ color: tooltip.bfsBlocked ? 'var(--c-danger)' : 'var(--c-text-muted)' }}>
          {tooltip.bfsBlocked ? 'yes' : 'no'}
        </Text>
      </Box>
      {tooltip.spriteInfo.length > 0 && tooltip.spriteInfo.map((line, i) => (
        <Box key={i} style={S.warning}>{line}</Box>
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
    <Box style={S.dualRow}>
      <Box style={S.dualColLeft}>
        <Box style={S.colHeadInfo}>▼ GROUND</Box>
        <Box><Text style={S.info}>0x{a1.toString(16).padStart(2, '0')}</Text> <Text style={S.text}>{lbl1}</Text></Box>
        <Box><Text style={S.dim}>type:</Text> <Text style={S.warning}>{cls1.type === 'ledge' ? `ledge (${cls1.dir})` : cls1.type}</Text></Box>
        {def1?.req && <Box><Text style={S.dim}>req:</Text> <Text style={S.warning}>{def1.req}</Text></Box>}
        <Box style={{ color: l1Reach ? 'var(--c-green-bright)' : 'var(--c-danger)', fontWeight: 'bold' }}>
          {l1Reach ? '✓ reachable' : '✗ wall'}
        </Box>
      </Box>
      <Box style={S.dualColRight}>
        <Box style={S.colHeadGold}>▲ ABOVE</Box>
        <Box><Text style={S.info}>0x{a0.toString(16).padStart(2, '0')}</Text> <Text style={S.text}>{lbl0}</Text></Box>
        <Box><Text style={S.dim}>type:</Text> <Text style={S.warning}>{cls0.type === 'ledge' ? `ledge (${cls0.dir})` : cls0.type}</Text></Box>
        {def0?.req && <Box><Text style={S.dim}>req:</Text> <Text style={S.warning}>{def0.req}</Text></Box>}
        <Box style={{ color: l0Reach ? 'var(--c-green-bright)' : 'var(--c-danger)', fontWeight: 'bold' }}>
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
  const layerColor = lockedLayer === 0 ? 'var(--c-gold)' : 'var(--c-info)';

  const cls = classifyTileAttr(attr, ctx0);
  const lbl = getAttrLabel(attr, ctx0);
  const def = getTileAttrsMap(ctx0)[attr];

  return (
    <Box style={S.col}>
      <Box style={{ color: layerColor, fontWeight: 'bold', fontSize: 10 }}>
        {layerLabel} <Text style={S.lockedTag}>LAYER LOCKED</Text>
      </Box>
      <Box><Text style={S.info}>0x{attr.toString(16).padStart(2, '0')}</Text> <Text style={S.text}>{lbl}</Text></Box>
      <Box><Text style={S.dim}>type:</Text> <Text style={S.warning}>{cls.type === 'ledge' ? `ledge (${cls.dir})` : cls.type}</Text></Box>
      {def?.req && <Box><Text style={S.dim}>req:</Text> <Text style={S.warning}>{def.req}</Text></Box>}
      <Box style={{ color: reach ? 'var(--c-green-bright)' : 'var(--c-danger)', fontWeight: 'bold' }}>
        {reach ? '✓ reachable' : '✗ wall'}
      </Box>
    </Box>
  );
};

const renderSingleLayer = (tooltip: TooltipData) => {
  return (
    <>
      <Box style={S.row}>
        <Text style={S.info}>0x{tooltip.attr.toString(16).padStart(2, '0')}</Text>
        <Text style={S.text}>{tooltip.label}</Text>
      </Box>
      <Box style={S.row}>
        <Text style={S.dim}>type:</Text>
        <Text style={S.warning}>{tooltip.type}</Text>
        {tooltip.req && <>
          <Text style={S.dim}>req:</Text>
          <Text style={{ color: tooltip.canPass ? 'var(--c-green-bright)' : 'var(--c-danger)' }}>
            {tooltip.req} {tooltip.canPass ? '✓' : '✗'}
          </Text>
        </>}
        {tooltip.hookTarget && (
          <Text style={S.hookable}>⎆ hookshottable</Text>
        )}
      </Box>
    </>
  );
};

export { TileTooltipContent };
export type { TooltipData };
