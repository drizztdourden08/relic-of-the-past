/* @layer renderer-widgets @kind component */
/**
 * Manage 4 bottle slots with content selection.
 */
import { useState } from 'react';
import { Select, Box, Text, Button } from '../../../../design-system/primitives';
import { cheatFillBottle, BottleContents } from '../../../../../lib/game';
import type { BottleContentsValue } from '../../../../../lib/game';

const BOTTLE_OPTIONS: { value: BottleContentsValue; label: string }[] = [
  { value: BottleContents.Empty, label: 'Empty' },
  { value: BottleContents.RedPotion, label: 'Red Potion' },
  { value: BottleContents.GreenPotion, label: 'Green Potion' },
  { value: BottleContents.BluePotion, label: 'Blue Potion' },
  { value: BottleContents.Fairy, label: 'Fairy' },
  { value: BottleContents.Bee, label: 'Bee' },
  { value: BottleContents.GoodBee, label: 'Good Bee' },
];

const BottlesTab = () => {
  const [slots, setSlots] = useState<BottleContentsValue[]>([
    BottleContents.Empty,
    BottleContents.Empty,
    BottleContents.Empty,
    BottleContents.Empty,
  ]);

  const handleChange = (slot: 0 | 1 | 2 | 3, value: BottleContentsValue) => {
    setSlots(prev => {
      const next = [...prev];
      next[slot] = value;
      return next;
    });
    cheatFillBottle(slot, value);
  };

  const fillAll = (contents: BottleContentsValue) => {
    for (let i = 0; i < 4; i++) {
      cheatFillBottle(i as 0 | 1 | 2 | 3, contents);
    }
    setSlots([contents, contents, contents, contents]);
  };

  return (
    <Box className="cheats-tab-bottles">
      <Box className="cheats-section">
        <Box className="cheats-section__title">Quick Fill All</Box>
        <Box className="cheats-row">
          <Button variant="secondary" size="sm" onClick={() => fillAll(BottleContents.Fairy)}>
            All Fairies
          </Button>
          <Button variant="tertiary" size="sm" onClick={() => fillAll(BottleContents.RedPotion)}>
            All Red
          </Button>
          <Button variant="tertiary" size="sm" onClick={() => fillAll(BottleContents.BluePotion)}>
            All Blue
          </Button>
          <Button variant="tertiary" size="sm" onClick={() => fillAll(BottleContents.Bee)}>
            All Bees
          </Button>
        </Box>
      </Box>

      <Box className="cheats-section">
        <Box className="cheats-section__title">Individual Slots</Box>
        {([0, 1, 2, 3] as const).map(slot => (
          <Box key={slot} className="cheats-bottles__slot">
            <Text className="cheats-bottles__slot-label">Slot {slot + 1}</Text>
            <Select
              className="cheats-bottles__select"
              value={String(slots[slot])}
              options={BOTTLE_OPTIONS.map(opt => ({ value: String(opt.value), label: opt.label }))}
              onChange={(v) => handleChange(slot, Number(v) as BottleContentsValue)}
            />
          </Box>
        ))}
      </Box>
    </Box>
  );
};

export { BottlesTab };
