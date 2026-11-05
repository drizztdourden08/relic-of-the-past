/* @layer renderer-components @kind component */
import { useRef, useState } from 'react';
import { Box } from '@drizztdourden08/tessera/primitives';
import { OptionsPanel } from '@drizztdourden08/tessera/composites';
import { PoolSidePanel } from '@app/compounds/PoolSidePanel';
import { useIsNarrow } from '@app/hooks/useIsNarrow';
import { FIRST_OPTION_TAB } from './randomizer-options/option-tabs.constants';
import { PanelBody } from './randomizer-options/PanelBody';
import { usePanelModel } from './randomizer-options/usePanelModel';
import { PANEL_TITLE, POOL_TAB, SPLIT_MIN_REM } from './RandomizerOptionsPanel.constants';
import type { PanelTab, RandomizerOptionsPanelProps } from './RandomizerOptionsPanel.type';
import './RandomizerOptionsPanel.css';

const RandomizerOptionsPanel = (props: RandomizerOptionsPanelProps) => {
  const { seed, value, onChange, activeTab, onTabChange } = props;
  const rootRef = useRef<HTMLDivElement>(null);
  const narrow = useIsNarrow(rootRef, SPLIT_MIN_REM);
  const [ownTab, setOwnTab] = useState<PanelTab>(FIRST_OPTION_TAB);
  const chosenTab = activeTab ?? ownTab;
  const tab = !narrow && chosenTab === POOL_TAB ? FIRST_OPTION_TAB : chosenTab;
  const handleTabChange = (id: string) => {
    setOwnTab(id as PanelTab);
    onTabChange?.(id as PanelTab);
  };
  const model = usePanelModel(props, narrow);
  const { error, listing, totals, tabs } = model;

  const pool = <PoolSidePanel groups={listing} totals={totals} error={error} />;

  return (
    <Box ref={rootRef} className="randomizer-options__root">
      <OptionsPanel
        title={PANEL_TITLE}
        tabs={tabs}
        activeTab={tab}
        onTabChange={handleTabChange}
        aside={narrow ? undefined : pool}
      >
        <PanelBody tab={tab} model={model} choices={value} seed={seed} onChange={onChange} />
      </OptionsPanel>
    </Box>
  );
};

export { RandomizerOptionsPanel };
