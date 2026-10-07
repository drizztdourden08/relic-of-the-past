/* @layer renderer-widgets @kind component */
/**
 * The six ability words of the A box (LIFT.n, READ, TALK, PULL, RUN, SWIM), drawn from the
 * game's letter sprites in the same 3x2 grid as the pause menu. Read-only: the words follow the
 * ability flags, and LIFT's level follows the gloves.
 */
import { Box, Image } from '@ds/primitives';
import { useGameUIStore } from '@app/stores/game-ui-store';
import { ABILITY_PANEL, ABILITY_WORDS } from '../ItemsTab.constants';

type AbilityTextGridProps = {
  scale: number;
  spritesBase: string;
};

/** Save index of the book, which lights READ and TALK. */
const BOOK_SLOT = 14;

/**
 * The flags the game would set, when the store's word is still zero: gloves light LIFT, the
 * book lights READ and TALK, PULL is always on, boots light RUN, flippers light SWIM.
 */
const derivedFlags = (gloves: number, book: number, boots: number, flippers: number): number =>
  (gloves > 0 ? 0x80 : 0) | (book > 0 ? 0x60 : 0) | 0x08 | (boots > 0 ? 0x04 : 0) | (flippers > 0 ? 0x02 : 0);

const AbilityTextGrid = ({ scale, spritesBase }: AbilityTextGridProps) => {
  const equipment = useGameUIStore((s) => s.equipment);
  const book = useGameUIStore((s) => s.inventory.items[BOOK_SLOT] ?? 0);
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
export type { AbilityTextGridProps };
