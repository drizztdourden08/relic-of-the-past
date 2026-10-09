/* @layer renderer-widgets @kind component */
import { Box, Image } from '@drizztdourden08/tessera/primitives';
import { useGameUIStore } from '@app/stores/game-ui-store';
import {
  ABILITY_FLAG_LIFT, ABILITY_FLAG_PULL, ABILITY_FLAG_READ_TALK, ABILITY_FLAG_RUN, ABILITY_FLAG_SWIM, ABILITY_PANEL, ABILITY_WORDS,
  BOOK_SLOT_INDEX,
} from '../ItemsTab.constants';
import type { PanelProps } from '../ItemsTab.type';

const derivedFlags = (gloves: number, book: number, boots: number, flippers: number): number =>
  (gloves > 0 ? ABILITY_FLAG_LIFT : 0) | (book > 0 ? ABILITY_FLAG_READ_TALK : 0) | ABILITY_FLAG_PULL
  | (boots > 0 ? ABILITY_FLAG_RUN : 0) | (flippers > 0 ? ABILITY_FLAG_SWIM : 0);

const AbilityTextGrid = ({ scale, spritesBase }: PanelProps) => {
  const equipment = useGameUIStore((s) => s.equipment);
  const book = useGameUIStore((s) => s.inventory.items[BOOK_SLOT_INDEX] ?? 0);
  const tile = 8 * scale;
  const flags = equipment.abilityFlags || derivedFlags(equipment.gloves, book, equipment.boots, equipment.flippers);
  const liftLevel = equipment.gloves + 1;
  const glyph = (src: string, key: string | number) => (
    <Image key={key} src={`${spritesBase}${src}.png`} alt="" draggable={false} width={tile} height={tile} className="cheats-items__pixel" />
  );

  return (
    <Box
      className="cheats-items__words"
      style={{
        top: tile * ABILITY_PANEL.textTop,
        left: tile * ABILITY_PANEL.left,
        width: tile * ABILITY_PANEL.textWidth,
        height: tile * ABILITY_PANEL.textRows,
      }}
    >
      {ABILITY_WORDS.map(({ label, bit }) => (
        <Box key={label} className="cheats-items__word">
          {(flags & (1 << bit)) !== 0 && (
            <>
              {label.split('').map((ch, i) => glyph(`font-letter-${ch.toLowerCase()}`, i))}
              {label === 'LIFT' && glyph(`font-level-${liftLevel}`, 'level')}
            </>
          )}
        </Box>
      ))}
    </Box>
  );
};

export { AbilityTextGrid };
