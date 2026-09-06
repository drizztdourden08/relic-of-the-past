/* @layer renderer-widgets @kind component */
/**
 * Kill enemies, damage multiplier, extra armor reduction, ignore collision,
 * dark-room lighting.
 */
import { useState } from 'react';
import { Box, Text, Button } from '../../../../design-system/primitives';
import { Toggle } from '../../../../design-system/primitives/Toggle';
import {
  cheatKillAllEnemies, cheatSetDamageMultiplier, cheatSetExtraArmorPct,
  cheatSetIgnoreCollision, getIgnoreCollisionEnabled,
  cheatSetIlluminateDarkRooms, getIlluminateDarkRoomsEnabled,
} from '../../../../../lib/game';

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

const MechanicsTab = () => {
  const [damageMult, setDamageMult] = useState(1);
  const [extraArmor, setExtraArmor] = useState(0);
  const [ignoreCollision, setIgnoreCollision] = useState(getIgnoreCollisionEnabled());
  const [illuminate, setIlluminate] = useState(getIlluminateDarkRoomsEnabled());

  const handleDamage = (value: number) => {
    setDamageMult(value);
    cheatSetDamageMultiplier(value);
  };

  const handleArmor = (value: number) => {
    setExtraArmor(value);
    cheatSetExtraArmorPct(value);
  };

  const handleIgnoreCollision = (on: boolean) => {
    setIgnoreCollision(on);
    cheatSetIgnoreCollision(on);
  };

  const handleIlluminate = (on: boolean) => {
    setIlluminate(on);
    cheatSetIlluminateDarkRooms(on);
  };

  return (
    <Box className="cheats-tab-mechanics">
      <Box className="cheats-section">
        <Box className="cheats-section__title">Mechanics</Box>
        <Box className="cheats-row">
          <Toggle label="Ignore movement restriction/collision" checked={ignoreCollision} onChange={handleIgnoreCollision} />
        </Box>
        <Box className="cheats-row">
          <Toggle label="Always light dark rooms" checked={illuminate} onChange={handleIlluminate} />
        </Box>
      </Box>

      <Box className="cheats-section">
        <Box className="cheats-section__title">Enemies</Box>
        <Box className="cheats-row">
          <Button variant="danger" size="sm" onClick={cheatKillAllEnemies}>
            Kill All Enemies
          </Button>
        </Box>
      </Box>

      <Box className="cheats-section">
        <Box className="cheats-section__title">Outgoing Damage</Box>
        <Box className="cheats-radio-group">
          {DAMAGE_OPTIONS.map(opt => (
            <Button
              key={opt.value}
              variant={damageMult === opt.value ? 'secondary' : 'tertiary'}
              size="sm"
              onClick={() => handleDamage(opt.value)}
            >
              {opt.label}
            </Button>
          ))}
        </Box>
      </Box>

      <Box className="cheats-section">
        <Box className="cheats-section__title">Extra Damage Reduction</Box>
        <Text as="p" className="cheats-note">
          Stacks with armor. Blue Mail = 50% base, Red Mail = 75% base.
        </Text>
        <Box className="cheats-radio-group">
          {ARMOR_OPTIONS.map(opt => (
            <Button
              key={opt.value}
              variant={extraArmor === opt.value ? 'secondary' : 'tertiary'}
              size="sm"
              onClick={() => handleArmor(opt.value)}
            >
              {opt.label}
            </Button>
          ))}
        </Box>
      </Box>
    </Box>
  );
};

export { MechanicsTab };
