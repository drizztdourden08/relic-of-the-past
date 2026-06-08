/* @layer renderer-widgets @kind component */
/**
 * BottlesTab — Manage 4 bottle slots with content selection.
 */
import { useState } from 'react';
import { NativeSelect } from '../../../components/primitives';
import { cheatFillBottle, BottleContents } from '../../../lib/game';
import type { BottleContentsValue } from '../../../lib/game';

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
    <div className="cheats-tab-bottles">
      <div className="cheats-section">
        <div className="cheats-section__title">Quick Fill All</div>
        <div className="cheats-row">
          <button className="cheats-btn cheats-btn--primary" onClick={() => fillAll(BottleContents.Fairy)}>
            All Fairies
          </button>
          <button className="cheats-btn" onClick={() => fillAll(BottleContents.RedPotion)}>
            All Red
          </button>
          <button className="cheats-btn" onClick={() => fillAll(BottleContents.BluePotion)}>
            All Blue
          </button>
          <button className="cheats-btn" onClick={() => fillAll(BottleContents.Bee)}>
            All Bees
          </button>
        </div>
      </div>

      <div className="cheats-section">
        <div className="cheats-section__title">Individual Slots</div>
        {([0, 1, 2, 3] as const).map(slot => (
          <div key={slot} className="cheats-bottles__slot">
            <span className="cheats-bottles__slot-label">Slot {slot + 1}</span>
            <NativeSelect
              className="cheats-bottles__select"
              value={slots[slot]}
              onChange={e => handleChange(slot, Number(e.target.value) as BottleContentsValue)}
            >
              {BOTTLE_OPTIONS.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </NativeSelect>
          </div>
        ))}
      </div>
    </div>
  );
};

export { BottlesTab };
