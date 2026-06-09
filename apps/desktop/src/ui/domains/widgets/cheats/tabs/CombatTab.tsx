/* @layer renderer-widgets @kind component */
/**
 * CombatTab — Kill enemies, damage multiplier, extra armor reduction.
 */
import { useState } from 'react';
import { Box, Text } from '../../../../design-system/primitives';
import { cheatKillAllEnemies, cheatSetDamageMultiplier, cheatSetExtraArmorPct } from '../../../../../lib/game';

const DAMAGE_OPTIONS = [
  { value: 1, label: '1×' },
  { value: 2, label: '2×' },
  { value: 4, label: '4×' },
  { value: 8, label: '8×' },
  { value: 16, label: '16×' },
  { value: 248, label: 'OHKO' },
];

const ARMOR_OPTIONS = [
  { value: 0, label: 'None' },
  { value: 25, label: '+25%' },
  { value: 50, label: '+50%' },
  { value: 75, label: '+75%' },
  { value: 100, label: 'Invincible' },
];

const CombatTab = () => {
  const [damageMult, setDamageMult] = useState(1);
  const [extraArmor, setExtraArmor] = useState(0);

  const handleDamage = (value: number) => {
    setDamageMult(value);
    cheatSetDamageMultiplier(value);
  };

  const handleArmor = (value: number) => {
    setExtraArmor(value);
    cheatSetExtraArmorPct(value);
  };

  return (
    <Box className="cheats-tab-combat">
      <Box className="cheats-section">
        <Box className="cheats-section__title">Enemies</Box>
        <Box className="cheats-row">
          <Box as="button" className="cheats-btn cheats-btn--danger" onClick={cheatKillAllEnemies}>
            Kill All Enemies
          </Box>
        </Box>
      </Box>

      <Box className="cheats-section">
        <Box className="cheats-section__title">Outgoing Damage</Box>
        <Box className="cheats-radio-group">
          {DAMAGE_OPTIONS.map(opt => (
            <Box
              as="button"
              key={opt.value}
              className={`cheats-radio ${damageMult === opt.value ? 'cheats-radio--active' : ''}`}
              onClick={() => handleDamage(opt.value)}
            >
              {opt.label}
            </Box>
          ))}
        </Box>
      </Box>

      <Box className="cheats-section">
        <Box className="cheats-section__title">Extra Damage Reduction</Box>
        <Text as="p" style={{ fontSize: 10, color: 'var(--c-text-muted)', margin: '0 0 6px' }}>
          Stacks with armor. Blue Mail = 50% base, Red Mail = 75% base.
        </Text>
        <Box className="cheats-radio-group">
          {ARMOR_OPTIONS.map(opt => (
            <Box
              as="button"
              key={opt.value}
              className={`cheats-radio ${extraArmor === opt.value ? 'cheats-radio--active' : ''}`}
              onClick={() => handleArmor(opt.value)}
            >
              {opt.label}
            </Box>
          ))}
        </Box>
      </Box>
    </Box>
  );
};

export { CombatTab };
