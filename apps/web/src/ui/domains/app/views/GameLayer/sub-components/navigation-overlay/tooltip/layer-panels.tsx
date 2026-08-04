/* @layer renderer-components @kind component */
/**
 * The body of a tile tooltip: one column per layer when both carry content,
 * otherwise a single column that still names the layer it describes.
 */
import { Box } from '../../../../../../../design-system/primitives/Box';
import { Text } from '../../../../../../../design-system/primitives/Text';
import { classifyTileAttr } from '@shared/game/navigation/tile-classification';
import { getTileAttrsMap, getAttrLabel } from '@shared/game/navigation/tile-attrs';
import type { FloodFillResult } from '@shared/game/navigation';
import type { TileAttrContext } from '@shared/game/navigation/tile-attrs';
import { getLockedLayer, getSingleLayer, layerHeading } from './layer-display';
import type { TooltipData } from './types';
import { S } from './styles';

const renderDualLayer = (tooltip: TooltipData, ctx0: TileAttrContext, result: FloodFillResult) => {
  const a0 = tooltip.layer0Attr!;
  const a1 = tooltip.layer1Attr ?? 0;
  const l0HasContent = a0 !== 0x00 || !!tooltip.layer0Reach;
  const l1HasContent = a1 !== 0x00 || !!tooltip.layer1Reach;
  // Only one side worth showing — still say WHICH side, and describe that
  // layer's own tile rather than whatever layer 0 happens to hold there.
  if (!l0HasContent || !l1HasContent) {
    const only = l0HasContent && !l1HasContent ? 0 : l1HasContent && !l0HasContent ? 1 : getSingleLayer(result, tooltip);
    return renderSingleLayer(tooltip, only);
  }

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

const renderSingleLayer = (tooltip: TooltipData, layer: 0 | 1) => {
  return (
    <>
      <Box style={layer === 0 ? S.colHeadGold : S.colHeadInfo}>{layerHeading(layer)}</Box>
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

export { renderDualLayer, renderLockedLayer, renderSingleLayer };
