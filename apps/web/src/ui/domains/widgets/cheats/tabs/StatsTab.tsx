/* @layer renderer-widgets @kind component */
/**
 * StatsTab — Health, rupees, bombs, arrows, magic controls.
 */
import { useState } from 'react';
import { NumberInput, RangeInput, Box, Text, Button } from '../../../../design-system/primitives';
import {
  cheatSetHealth, cheatSetMaxHealth, cheatSetRupees,
  cheatSetBombs, cheatSetArrows, cheatRefillMagic,
} from '../../../../../lib/game';
import { useGameUIStore } from '../../../../../stores/game-ui-store';

const StatsTab = () => {
  const { maxRupees, maxBombs, maxArrows } = useGameUIStore(s => s.hud);

  const [health, setHealth] = useState(160);
  const [maxHealth, setMaxHealth] = useState(160);
  const [rupees, setRupees] = useState(maxRupees);
  const [bombs, setBombs] = useState(maxBombs);
  const [arrows, setArrows] = useState(maxArrows);

  return (
    <Box className="cheats-tab-stats">
      <Box className="cheats-section">
        <Box className="cheats-section__title">Quick Actions</Box>
        <Box className="cheats-row">
          <Button variant="secondary" size="sm" onClick={() => { cheatSetHealth(160); cheatSetMaxHealth(160); }}>
            Full Heal (20♥)
          </Button>
          <Button variant="secondary" size="sm" onClick={() => cheatSetRupees(maxRupees)}>
            Max Rupees ({maxRupees})
          </Button>
          <Button variant="secondary" size="sm" onClick={() => cheatRefillMagic()}>
            Fill Magic
          </Button>
        </Box>
        <Box className="cheats-row">
          <Button variant="tertiary" size="sm" onClick={() => { cheatSetBombs(maxBombs); cheatSetArrows(maxArrows); }}>
            Max Bombs & Arrows ({maxBombs}/{maxArrows})
          </Button>
          <Button variant="danger" size="sm" onClick={() => cheatSetHealth(8)}>
            Set 1♥
          </Button>
          <Button variant="danger" size="sm" onClick={() => cheatSetHealth(0)}>
            Kill Player
          </Button>
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
            <Text className="cheats-stat-val">{health / 8}♥</Text>
            <Button variant="tertiary" size="sm" onClick={() => cheatSetHealth(health)}>Set</Button>
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
            <Text className="cheats-stat-val">{maxHealth / 8}♥</Text>
            <Button variant="tertiary" size="sm" onClick={() => cheatSetMaxHealth(maxHealth)}>Set</Button>
          </Box>
        </Box>
      </Box>

      <Box className="cheats-section">
        <Box className="cheats-section__title">Resources</Box>
        <Box className="cheats-row">
          <Text className="cheats-row__label">Rupees</Text>
          <Box className="cheats-row__controls">
            <NumberInput
              min={0} max={maxRupees} value={rupees} sizeToContent
              onChange={v => setRupees(Math.min(maxRupees, Math.max(0, v)))}
            />
            <Button variant="tertiary" size="sm" onClick={() => cheatSetRupees(rupees)}>Set</Button>
          </Box>
        </Box>
        <Box className="cheats-row">
          <Text className="cheats-row__label">Bombs</Text>
          <Box className="cheats-row__controls">
            <NumberInput
              min={0} max={maxBombs} value={bombs} sizeToContent
              onChange={v => setBombs(Math.min(maxBombs, Math.max(0, v)))}
            />
            <Button variant="tertiary" size="sm" onClick={() => cheatSetBombs(bombs)}>Set</Button>
          </Box>
        </Box>
        <Box className="cheats-row">
          <Text className="cheats-row__label">Arrows</Text>
          <Box className="cheats-row__controls">
            <NumberInput
              min={0} max={maxArrows} value={arrows} sizeToContent
              onChange={v => setArrows(Math.min(maxArrows, Math.max(0, v)))}
            />
            <Button variant="tertiary" size="sm" onClick={() => cheatSetArrows(arrows)}>Set</Button>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export { StatsTab };
