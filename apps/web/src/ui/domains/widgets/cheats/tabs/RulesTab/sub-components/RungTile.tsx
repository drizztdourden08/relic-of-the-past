/* @layer renderer-widgets @kind component */
/**
 * One ladder as a wide tile: the sprite and its name on the left, the rungs as chips on
 * the right, the current rung lit. The first rung is the game's own value, so the tile
 * lights its edge only once another rung is chosen. A tile whose category the profile
 * turns off draws inert, with the reason as its tooltip.
 *
 * Presentational only: the value arrives read, and every press leaves as a number.
 */
import { Box, Button, Image, Text } from '@ds/primitives';
import { spriteUrlOf } from '@shared/game/logic/queries/item-sprites';
import type { RungTileSpec, TileState } from '../RulesTab.type';

type RungTileProps = {
  spec: RungTileSpec;
  value: number;
  /** The category is off: the tile draws inert and this sentence is its tooltip. */
  reason?: string;
  onChange: (value: number) => void;
};

const PLACEHOLDER = <Box className="cheats-rules__sprite cheats-rules__sprite--placeholder" />;

const stateOf = (disabled: boolean, changed: boolean): TileState => {
  if (disabled) return 'disabled';
  return changed ? 'on' : 'off';
};

const RungTile = (props: RungTileProps) => {
  const { spec, value, reason, onChange } = props;
  const { label, name, sprite, rungs } = spec;
  const disabled = reason !== undefined;
  const changed = value !== rungs[0].value;

  return (
    <Box className="cheats-rung" data-state={stateOf(disabled, changed)} title={reason ?? label} role="group" aria-label={label}>
      <Box className="cheats-rung__art">
        <Image className="cheats-rules__sprite" src={spriteUrlOf(sprite)} alt="" draggable={false} fallback={PLACEHOLDER} />
        <Text className="cheats-rules__name">{name}</Text>
      </Box>
      <Box className="cheats-rung__chips">
        {rungs.map((rung) => (
          <Button
            key={rung.value}
            variant="tertiary"
            size="sm"
            className="cheats-rung__chip"
            active={rung.value === value}
            disabled={disabled}
            onClick={() => onChange(rung.value)}
          >
            {rung.label}
          </Button>
        ))}
      </Box>
    </Box>
  );
};

export { RungTile };
export type { RungTileProps };
