/* @layer renderer-widgets @kind component */
import { Box, Button, Icon, SegmentedControl, StatRow } from '@drizztdourden08/tessera/primitives';
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

      {mode === 'manual' && (
        <Box style={S.fnRowTop}>
          <Button variant="secondary" size="xs" data-testid="nav-flood-btn" loading={running} icon={<Icon name="play" />} onClick={handleRun}>
            Flood Fill
          </Button>
          <Button variant="secondary" size="xs" data-testid="nav-clear-btn" icon={<Icon name="x" />} onClick={handleClear} disabled={!result}>
            Clear
          </Button>
        </Box>
      )}

      <Box style={S.fnRowTop}>
        <TileRecorderBtn attrGrid={result?.attrGrid ?? null} overworldScreenIndex={overworldScreenIndex} />
        <PathCopyBtn />
      </Box>

      {result && (
        <Box>
          <StatRow label="Reachable" value={`${reachableSum}/${totalTilesSum} (${totalTilesSum > 0 ? (reachableSum / totalTilesSum * 100).toFixed(0) : '0'}%)`} mono />
          <StatRow label="Entrances" value={entranceSum} mono />
          <StatRow label="Edges" value={`${externalConnections.length}${internalConnections.length > 0 ? ` + ${internalConnections.filter(c => !c.isIntraRoom || c.edge === 'south' || c.edge === 'east').length} int` : ''}`} mono />
        </Box>
      )}
    </Box>
  );
};

export { FunctionsPanel };
