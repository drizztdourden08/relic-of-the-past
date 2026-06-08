/* @layer renderer-widgets @kind component */
/**
 * StatsTab — Health, rupees, bombs, arrows, magic controls.
 */
import { useState } from 'react';
import { NumberInput, RangeInput, Box, Text } from '../../../../design-system/primitives';
import {
  cheatSetHealth, cheatSetMaxHealth, cheatSetRupees,
  cheatSetBombs, cheatSetArrows, cheatRefillMagic,
} from '../../../../../lib/game';

const StatsTab = () => {
  const [health, setHealth] = useState(160);
  const [maxHealth, setMaxHealth] = useState(160);
  const [rupees, setRupees] = useState(999);
  const [bombs, setBombs] = useState(99);
  const [arrows, setArrows] = useState(99);

  return (
    <Box className="cheats-tab-stats">
      <Box className="cheats-section">
        <Box className="cheats-section__title">Quick Actions</Box>
        <Box className="cheats-row">
          <Box as="button" className="cheats-btn cheats-btn--primary" onClick={() => { cheatSetHealth(160); cheatSetMaxHealth(160); }}>
            Full Heal (20♥)
          </Box>
          <Box as="button" className="cheats-btn cheats-btn--primary" onClick={() => cheatSetRupees(999)}>
            999 Rupees
          </Box>
          <Box as="button" className="cheats-btn cheats-btn--primary" onClick={() => cheatRefillMagic()}>
            Fill Magic
          </Box>
        </Box>
        <Box className="cheats-row">
          <Box as="button" className="cheats-btn" onClick={() => { cheatSetBombs(99); cheatSetArrows(99); }}>
            Max Bombs & Arrows
          </Box>
          <Box as="button" className="cheats-btn cheats-btn--danger" onClick={() => cheatSetHealth(8)}>
            Set 1♥
          </Box>
          <Box as="button" className="cheats-btn cheats-btn--danger" onClick={() => cheatSetHealth(0)}>
            Kill Link
          </Box>
        </Box>
      </Box>

      <Box className="cheats-section">
        <Box className="cheats-section__title">Health</Box>
        <Box className="cheats-row">
          <Text className="cheats-row__label">Current</Text>
          <Box className="cheats-row__controls">
            <RangeInput
              className="cheats-slider"
              min={0} max={maxHealth} step={8} value={health}
              onChange={e => setHealth(Number(e.target.value))}
            />
            <Text style={{ fontSize: 11, minWidth: 30 }}>{health / 8}♥</Text>
            <Box as="button" className="cheats-btn" onClick={() => cheatSetHealth(health)}>Set</Box>
          </Box>
        </Box>
        <Box className="cheats-row">
          <Text className="cheats-row__label">Max</Text>
          <Box className="cheats-row__controls">
            <RangeInput
              className="cheats-slider"
              min={8} max={160} step={8} value={maxHealth}
              onChange={e => setMaxHealth(Number(e.target.value))}
            />
            <Text style={{ fontSize: 11, minWidth: 30 }}>{maxHealth / 8}♥</Text>
            <Box as="button" className="cheats-btn" onClick={() => cheatSetMaxHealth(maxHealth)}>Set</Box>
          </Box>
        </Box>
      </Box>

      <Box className="cheats-section">
        <Box className="cheats-section__title">Resources</Box>
        <Box className="cheats-row">
          <Text className="cheats-row__label">Rupees</Text>
          <Box className="cheats-row__controls">
            <NumberInput
              className="cheats-input"
              min={0} max={999} value={rupees}
              onChange={v => setRupees(Math.min(999, Math.max(0, v)))}
            />
            <Box as="button" className="cheats-btn" onClick={() => cheatSetRupees(rupees)}>Set</Box>
          </Box>
        </Box>
        <Box className="cheats-row">
          <Text className="cheats-row__label">Bombs</Text>
          <Box className="cheats-row__controls">
            <NumberInput
              className="cheats-input"
              min={0} max={99} value={bombs}
              onChange={v => setBombs(Math.min(99, Math.max(0, v)))}
            />
            <Box as="button" className="cheats-btn" onClick={() => cheatSetBombs(bombs)}>Set</Box>
          </Box>
        </Box>
        <Box className="cheats-row">
          <Text className="cheats-row__label">Arrows</Text>
          <Box className="cheats-row__controls">
            <NumberInput
              className="cheats-input"
              min={0} max={99} value={arrows}
              onChange={v => setArrows(Math.min(99, Math.max(0, v)))}
            />
            <Box as="button" className="cheats-btn" onClick={() => cheatSetArrows(arrows)}>Set</Box>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export { StatsTab };
