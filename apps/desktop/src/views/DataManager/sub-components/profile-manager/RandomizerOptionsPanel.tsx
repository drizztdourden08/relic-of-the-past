/* @layer renderer-components @kind component */
import { useRef, useState } from 'react';
import { Box, Tabs, Text } from '@drizztdourden08/tessera/primitives';
import { SplitPane } from '@drizztdourden08/tessera/composites';
import { PoolListing } from '@app/compounds/PoolListing';
import { useIsNarrow } from '@app/hooks/useIsNarrow';
import { FIRST_OPTION_TAB } from './randomizer-options/option-tabs.constants';
import { PanelBody } from './randomizer-options/PanelBody';
import { poolEndLabel } from './randomizer-options/pool-end-label';
import { usePanelModel } from './randomizer-options/usePanelModel';
import { OPTIONS_SHARE, POOL_TAB, SPLIT_MIN_REM } from './RandomizerOptionsPanel.constants';
import type { PanelTab, RandomizerOptionsPanelProps } from './RandomizerOptionsPanel.type';
import './RandomizerOptionsPanel.css';

const RandomizerOptionsPanel = (props: RandomizerOptionsPanelProps) => {
  const { seed, value, onChange } = props;
  const rootRef = useRef<HTMLDivElement>(null);
  const narrow = useIsNarrow(rootRef, SPLIT_MIN_REM);
  const [chosenTab, setTab] = useState<PanelTab>(FIRST_OPTION_TAB);
  const tab = !narrow && chosenTab === POOL_TAB ? FIRST_OPTION_TAB : chosenTab;
  const model = usePanelModel(props, narrow);
  const { accounting, error, listing, totals, tabs } = model;

  const pool = <PoolListing groups={listing} totals={totals} error={error} />;

  const options = (
    <Box className="randomizer-options">
      <Box className="randomizer-options__header">
        <Text className="randomizer-options__title">randomizer options</Text>
        <Tabs tabs={tabs} activeTab={tab} onTabChange={(id) => setTab(id as PanelTab)} hideZero />
      </Box>
      <PanelBody tab={tab} model={model} choices={value} seed={seed} onChange={onChange} />
    </Box>
  );

  return (
    <Box ref={rootRef} className="randomizer-options__root">
      {narrow ? options : (
        <SplitPane
          className="randomizer-options__split"
          defaultRatio={OPTIONS_SHARE}
          defaultCollapsed="end"
          startLabel="options"
          endLabel={poolEndLabel(accounting)}
          start={options}
          end={pool}
        />
      )}
    </Box>
  );
};

export { RandomizerOptionsPanel };
