/* @layer renderer-components @kind component */
import { useRef, useState } from 'react';
import { Box, Flex, Tabs, Text } from '@drizztdourden08/tessera/primitives';
import { SidePanel } from '@drizztdourden08/tessera/composites';
import { PoolListing } from '@app/compounds/PoolListing';
import { useIsNarrow } from '@app/hooks/useIsNarrow';
import { FIRST_OPTION_TAB } from './randomizer-options/option-tabs.constants';
import { PanelBody } from './randomizer-options/PanelBody';
import { usePanelModel } from './randomizer-options/usePanelModel';
import {
  POOL_CONTAINER_TITLE, POOL_PANEL_SIZE, POOL_PANEL_TITLE, POOL_STORAGE_KEY, POOL_TAB, SPLIT_MIN_REM,
} from './RandomizerOptionsPanel.constants';
import type { PanelTab, RandomizerOptionsPanelProps } from './RandomizerOptionsPanel.type';
import './RandomizerOptionsPanel.css';

const RandomizerOptionsPanel = (props: RandomizerOptionsPanelProps) => {
  const { seed, value, onChange } = props;
  const rootRef = useRef<HTMLDivElement>(null);
  const narrow = useIsNarrow(rootRef, SPLIT_MIN_REM);
  const [chosenTab, setTab] = useState<PanelTab>(FIRST_OPTION_TAB);
  const tab = !narrow && chosenTab === POOL_TAB ? FIRST_OPTION_TAB : chosenTab;
  const model = usePanelModel(props, narrow);
  const { error, listing, totals, tabs } = model;

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
        <Flex gap="2xs" align="stretch" className="randomizer-options__split">
          <Box className="randomizer-options__main">{options}</Box>
          <SidePanel
            side="end"
            title={POOL_PANEL_TITLE}
            {...POOL_PANEL_SIZE}
            storageKey={POOL_STORAGE_KEY}
            containers={[{
              title: POOL_CONTAINER_TITLE,
              content: <PoolListing groups={listing} totals={totals} error={error} titled={false} />,
            }]}
          />
        </Flex>
      )}
    </Box>
  );
};

export { RandomizerOptionsPanel };
