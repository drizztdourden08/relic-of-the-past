/* @layer renderer-widgets @kind component */
import { Box, Text, Button, SegmentedControl } from '../../../../design-system/primitives';
import { S } from '../styles';
import { TileRecorderBtn } from './TileRecorderBtn';
import { PathCopyBtn } from './PathCopyBtn';
import type { FunctionsPanelProps } from './FunctionsPanel.type';
import { MODE_OPTIONS } from './FunctionsPanel.constants';

const FunctionsPanel = (props: FunctionsPanelProps) => {
  const {
    mode, setMode, running, handleRun, handleClear, result, overworldScreenIndex,
    reachableSum, totalTilesSum, entranceSum, externalConnections, internalConnections,
  } = props;

  return (
    <Box style={S.section}>
      <Box style={S.sectionTitle}>Functions</Box>

      <SegmentedControl value={mode} options={MODE_OPTIONS} onChange={setMode} />

      {/* Flooding by hand is the point of manual mode; in auto the widget owns the timing. */}
      {mode === 'manual' && (
        <Box style={S.fnRowTop}>
          <Button variant="bare" data-testid="nav-flood-btn" style={{ ...S.btn, ...(running ? S.btnDisabled : {}) }} onClick={handleRun} disabled={running}>
            {running ? '⏳' : '▶'} Flood Fill
          </Button>
          <Button variant="bare" data-testid="nav-clear-btn" style={{ ...S.btn, ...(result ? {} : S.btnDisabled) }} onClick={handleClear} disabled={!result}>
            ✕ Clear
          </Button>
        </Box>
      )}

      <Box style={S.fnRowTop}>
        <TileRecorderBtn attrGrid={result?.attrGrid ?? null} overworldScreenIndex={overworldScreenIndex} />
        <PathCopyBtn />
      </Box>

      {result && (
        <Box style={{ ...S.infoBox, marginTop: 4 }}>
          <Box style={S.infoRow}>
            <Text style={S.infoLabel}>Reachable</Text>
            <Text>{reachableSum}/{totalTilesSum} ({totalTilesSum > 0 ? (reachableSum / totalTilesSum * 100).toFixed(0) : '0'}%)</Text>
          </Box>
          <Box style={S.infoRow}>
            <Text style={S.infoLabel}>Entrances</Text>
            <Text>{entranceSum}</Text>
          </Box>
          <Box style={S.infoRow}>
            <Text style={S.infoLabel}>Edges</Text>
            <Text>{externalConnections.length}{internalConnections.length > 0 ? ` + ${internalConnections.filter(c => !c.isIntraRoom || c.edge === 'south' || c.edge === 'east').length} int` : ''}</Text>
          </Box>
        </Box>
      )}
    </Box>
  );
};

export { FunctionsPanel };
