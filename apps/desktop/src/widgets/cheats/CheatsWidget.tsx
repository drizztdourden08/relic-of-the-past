/**
 * CheatsWidget — Widget content providing cheat controls for the game.
 * Tabs: Items, Stats, Combat, Bottles
 */
import { useState } from 'react';
import { ItemsTab } from './tabs/ItemsTab';
import { StatsTab } from './tabs/StatsTab';
import { CombatTab } from './tabs/CombatTab';
import { BottlesTab } from './tabs/BottlesTab';
import './CheatsWidget.css';

type CheatTab = 'items' | 'stats' | 'combat' | 'bottles';

const TABS: { key: CheatTab; label: string }[] = [
  { key: 'items', label: 'Items' },
  { key: 'stats', label: 'Stats' },
  { key: 'combat', label: 'Combat' },
  { key: 'bottles', label: 'Bottles' },
];

const CheatsWidgetContent = () => {
  const [tab, setTab] = useState<CheatTab>('stats');

  return (
    <div className="cheats-widget">
      <div className="cheats-widget__tabs">
        {TABS.map(t => (
          <button
            key={t.key}
            className={`cheats-widget__tab ${tab === t.key ? 'cheats-widget__tab--active' : ''}`}
            onClick={() => setTab(t.key)}
          >
            {t.label}
          </button>
        ))}
      </div>
      <div className="cheats-widget__content">
        {tab === 'items' && <ItemsTab />}
        {tab === 'stats' && <StatsTab />}
        {tab === 'combat' && <CombatTab />}
        {tab === 'bottles' && <BottlesTab />}
      </div>
    </div>
  );
};

export { CheatsWidgetContent };
