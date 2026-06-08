/* @layer renderer-widgets @kind component */
/**
 * BottlesTab — Manage 4 bottle slots with content selection.
 */
import { useState } from 'react';
import { Select, Box, Text } from '../../../../design-system/primitives';
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
          <Box as="button" className="cheats-btn cheats-btn--primary" onClick={() => fillAll(BottleContents.Fairy)}>
            All Fairies
          </Box>
          <Box as="button" className="cheats-btn" onClick={() => fillAll(BottleContents.RedPotion)}>
            All Red
          </Box>
          <Box as="button" className="cheats-btn" onClick={() => fillAll(BottleContents.BluePotion)}>
            All Blue
          </Box>
          <Box as="button" className="cheats-btn" onClick={() => fillAll(BottleContents.Bee)}>
            All Bees
          </Box>
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
