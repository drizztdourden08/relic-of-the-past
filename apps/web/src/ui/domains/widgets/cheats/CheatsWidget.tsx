/* @layer renderer-widgets @kind component */
/**
 * CheatsWidget — Widget content providing cheat controls for the game.
 * Tabs: Items, Stats, Mechanics, Bottles
 */
import { useState } from 'react';
import { Box } from '../../../design-system/primitives/Box';
import { TabBar } from '../../../design-system/primitives/TabBar';
import { ItemsTab } from './tabs/ItemsTab';
import { StatsTab } from './tabs/StatsTab';
import { MechanicsTab } from './tabs/MechanicsTab';
import { BottlesTab } from './tabs/BottlesTab';
import './CheatsWidget.css';

type CheatTab = 'items' | 'stats' | 'mechanics' | 'bottles';

const TABS = [
  { id: 'items', label: 'Items' },
  { id: 'stats', label: 'Stats' },
  { id: 'mechanics', label: 'Mechanics' },
  { id: 'bottles', label: 'Bottles' },
];

const CheatsWidgetContent = () => {
  const [tab, setTab] = useState<CheatTab>('stats');

  return (
    <Box className="cheats-widget">
      <TabBar tabs={TABS} activeTab={tab} onTabChange={(id) => setTab(id as CheatTab)} />
      <Box className="cheats-widget__content">
        {tab === 'items' && <ItemsTab />}
        {tab === 'stats' && <StatsTab />}
        {tab === 'mechanics' && <MechanicsTab />}
        {tab === 'bottles' && <BottlesTab />}
      </Box>
    </Box>
  );
};

export { CheatsWidgetContent };
