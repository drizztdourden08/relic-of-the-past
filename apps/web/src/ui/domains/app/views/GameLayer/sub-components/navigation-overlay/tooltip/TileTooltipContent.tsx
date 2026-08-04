/* @layer renderer-components @kind data */
import { Box } from '../../../../../../../design-system/primitives/Box';
import { Text } from '../../../../../../../design-system/primitives/Text';
import type { FloodFillResult } from '@shared/game/navigation';
import { getLayerDisplayMode, getSingleLayer } from './layer-display';
import { renderDualLayer, renderLockedLayer, renderSingleLayer } from './layer-panels';
import type { TooltipData } from './types';
import { S } from './styles';

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

      {mode === 'dual' && tooltip.layer0Attr !== undefined && renderDualLayer(tooltip, ctx0, result)}
      {mode === 'locked' && tooltip.layer0Attr !== undefined && renderLockedLayer(tooltip, ctx0, result)}
      {mode === 'single' && renderSingleLayer(tooltip, getSingleLayer(result, tooltip))}

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

export { TileTooltipContent };
