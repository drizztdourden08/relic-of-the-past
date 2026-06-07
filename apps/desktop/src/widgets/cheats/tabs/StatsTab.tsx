/* @layer renderer-widgets @kind component */
/**
 * StatsTab — Health, rupees, bombs, arrows, magic controls.
 */
import { useState } from 'react';
import {
  cheatSetHealth, cheatSetMaxHealth, cheatSetRupees,
  cheatSetBombs, cheatSetArrows, cheatRefillMagic,
} from '../../../lib/game';

const StatsTab = () => {
  const [health, setHealth] = useState(160);
  const [maxHealth, setMaxHealth] = useState(160);
  const [rupees, setRupees] = useState(999);
  const [bombs, setBombs] = useState(99);
  const [arrows, setArrows] = useState(99);

  return (
    <div className="cheats-tab-stats">
      <div className="cheats-section">
        <div className="cheats-section__title">Quick Actions</div>
        <div className="cheats-row">
          <button className="cheats-btn cheats-btn--primary" onClick={() => { cheatSetHealth(160); cheatSetMaxHealth(160); }}>
            Full Heal (20♥)
          </button>
          <button className="cheats-btn cheats-btn--primary" onClick={() => cheatSetRupees(999)}>
            999 Rupees
          </button>
          <button className="cheats-btn cheats-btn--primary" onClick={() => cheatRefillMagic()}>
            Fill Magic
          </button>
        </div>
        <div className="cheats-row">
          <button className="cheats-btn" onClick={() => { cheatSetBombs(99); cheatSetArrows(99); }}>
            Max Bombs & Arrows
          </button>
          <button className="cheats-btn cheats-btn--danger" onClick={() => cheatSetHealth(8)}>
            Set 1♥
          </button>
          <button className="cheats-btn cheats-btn--danger" onClick={() => cheatSetHealth(0)}>
            Kill Link
          </button>
        </div>
      </div>

      <div className="cheats-section">
        <div className="cheats-section__title">Health</div>
        <div className="cheats-row">
          <span className="cheats-row__label">Current</span>
          <div className="cheats-row__controls">
            <input
              type="range" className="cheats-slider"
              min={0} max={maxHealth} step={8} value={health}
              onChange={e => setHealth(Number(e.target.value))}
            />
            <span style={{ fontSize: 11, minWidth: 30 }}>{health / 8}♥</span>
            <button className="cheats-btn" onClick={() => cheatSetHealth(health)}>Set</button>
          </div>
        </div>
        <div className="cheats-row">
          <span className="cheats-row__label">Max</span>
          <div className="cheats-row__controls">
            <input
              type="range" className="cheats-slider"
              min={8} max={160} step={8} value={maxHealth}
              onChange={e => setMaxHealth(Number(e.target.value))}
            />
            <span style={{ fontSize: 11, minWidth: 30 }}>{maxHealth / 8}♥</span>
            <button className="cheats-btn" onClick={() => cheatSetMaxHealth(maxHealth)}>Set</button>
          </div>
        </div>
      </div>

      <div className="cheats-section">
        <div className="cheats-section__title">Resources</div>
        <div className="cheats-row">
          <span className="cheats-row__label">Rupees</span>
          <div className="cheats-row__controls">
            <input
              type="number" className="cheats-input"
              min={0} max={999} value={rupees}
              onChange={e => setRupees(Math.min(999, Math.max(0, Number(e.target.value))))}
            />
            <button className="cheats-btn" onClick={() => cheatSetRupees(rupees)}>Set</button>
          </div>
        </div>
        <div className="cheats-row">
          <span className="cheats-row__label">Bombs</span>
          <div className="cheats-row__controls">
            <input
              type="number" className="cheats-input"
              min={0} max={99} value={bombs}
              onChange={e => setBombs(Math.min(99, Math.max(0, Number(e.target.value))))}
            />
            <button className="cheats-btn" onClick={() => cheatSetBombs(bombs)}>Set</button>
          </div>
        </div>
        <div className="cheats-row">
          <span className="cheats-row__label">Arrows</span>
          <div className="cheats-row__controls">
            <input
              type="number" className="cheats-input"
              min={0} max={99} value={arrows}
              onChange={e => setArrows(Math.min(99, Math.max(0, Number(e.target.value))))}
            />
            <button className="cheats-btn" onClick={() => cheatSetArrows(arrows)}>Set</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export { StatsTab };
