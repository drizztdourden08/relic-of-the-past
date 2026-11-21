/* @layer renderer-widgets @kind component */
import { useT } from '@drizztdourden08/brock-react';
import { Box, Button, Icon, SegmentedControl, StatRow } from '@drizztdourden08/tessera/primitives';
import { TileRecorderBtn } from './TileRecorderBtn';
import { PathCopyBtn } from './PathCopyBtn';
import type { FunctionsPanelProps } from './FunctionsPanel.type';
import { modeOptions } from './FunctionsPanel.constants';

const FunctionsPanel = (props: FunctionsPanelProps) => {
  const t = useT();
  const {
    mode, setMode, running, handleRun, handleClear, result, overworldScreenIndex,
    reachableSum, totalTilesSum, entranceSum, externalConnections, internalConnections,
  } = props;

  return (
    <Box className="nav-section">
      <Box className="nav-section-title">{t('views-navigation:functions.title')}</Box>

      <SegmentedControl value={mode} options={modeOptions(t)} onChange={setMode} />

      {mode === 'manual' && (
        <Box className="nav-fn-row-top">
          <Button variant="secondary" size="xs" data-testid="nav-flood-btn" loading={running} icon={<Icon name="play" />} onClick={handleRun}>
            {t('views-navigation:functions.flood')}
          </Button>
          <Button variant="secondary" size="xs" data-testid="nav-clear-btn" icon={<Icon name="x" />} onClick={handleClear} disabled={!result}>
            {t('views-navigation:functions.clear')}
          </Button>
        </Box>
      )}

      <Box className="nav-fn-row-top">
        <TileRecorderBtn attrGrid={result?.attrGrid ?? null} overworldScreenIndex={overworldScreenIndex} />
        <PathCopyBtn />
      </Box>

      {result && (
        <Box>
          <StatRow label={t('views-navigation:functions.reachable')} value={t('views-navigation:functions.reachable.value', { reachable: reachableSum, total: totalTilesSum, percent: totalTilesSum > 0 ? (reachableSum / totalTilesSum * 100).toFixed(0) : '0' })} mono />
          <StatRow label={t('views-navigation:functions.entrances')} value={entranceSum} mono />
          <StatRow label={t('views-navigation:functions.edges')} value={internalConnections.length > 0 ? t('views-navigation:functions.edges.withinternal', { external: externalConnections.length, internal: internalConnections.filter(c => !c.isIntraRoom || c.edge === 'south' || c.edge === 'east').length }) : t('views-navigation:functions.edges.value', { external: externalConnections.length })} mono />
        </Box>
      )}
    </Box>
  );
};

export { FunctionsPanel };
