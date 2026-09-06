/* @layer renderer-components @kind component */
/**
 * One light as a tile: the item's own sprite, and a box saying whether the
 * setting accepts it. Nothing else, because the art is the label, so four tiles fit
 * in a row instead of four sentences repeating what the pictures already say.
 *
 * The name is not lost with the words: it is the tile's tooltip and the box's
 * accessible name, so a pointer and a screen reader are told the same thing
 * the sprite tells the eye. A tile held off by a sibling setting adds the
 * reason to that tooltip and wears the blocking edge.
 *
 * Presentational only: the model arrives derived (behavior/dark-room-light-
 * tiles.ts) and every click leaves as a plain checked flag.
 */
import { Box, Checkbox, Image } from '@ds/primitives';
import type { DarkRoomLightTileModel } from '../behavior/dark-room-light-tiles';
import './DarkRoomLightTile.css';

interface DarkRoomLightTileProps {
  tile: DarkRoomLightTileModel;
  /** No light is asked for, or a read-only render: the tile draws inert. */
  disabled: boolean;
  onChange?: (checked: boolean) => void;
}

// The same placeholder stands in for a set that is not extracted yet and for a
// sprite file that fails to load, so a tile never shows a broken-image glyph.
const PLACEHOLDER = <Box className="dark-room-light__sprite dark-room-light__sprite--placeholder" />;

/** Which of the four faces the tile wears: inert, held off, passed over, or accepted. */
const stateOf = (disabled: boolean, forced: boolean, checked: boolean): string => {
  if (disabled) return 'disabled';
  if (forced) return 'forced';
  return checked ? 'on' : 'off';
};

const DarkRoomLightTile = (props: DarkRoomLightTileProps) => {
  const { tile, disabled, onChange } = props;
  const { name, sprite, checked, reason } = tile;
  const forced = reason !== undefined;
  const title = forced ? `${name} ${reason}` : name;

  return (
    <Box className="dark-room-light" data-state={stateOf(disabled, forced, checked)} title={title}>
      <Checkbox
        className="dark-room-light__control"
        checked={checked}
        ariaLabel={title}
        disabled={disabled || forced || onChange === undefined}
        onChange={(next) => onChange?.(next)}
        label={sprite === undefined ? PLACEHOLDER : (
          <Image className="dark-room-light__sprite" src={sprite} alt="" draggable={false} fallback={PLACEHOLDER} />
        )}
      />
    </Box>
  );
};

export { DarkRoomLightTile };
export type { DarkRoomLightTileProps };
