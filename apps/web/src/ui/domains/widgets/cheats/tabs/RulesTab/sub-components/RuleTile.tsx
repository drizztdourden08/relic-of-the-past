/* @layer renderer-widgets @kind component */
/**
 * One state as a tile: the item's own sprite over a tick box, with a short name between
 * them. The whole square is one click target, the full label is the tooltip and the
 * box's accessible name. A tile whose category the profile turns off draws inert, and
 * its tooltip carries the reason.
 *
 * Presentational only: the value arrives read, and every click leaves as a flag.
 */
import { Box, Checkbox, Image, Text } from '@ds/primitives';
import { spriteUrlOf } from '@shared/game/logic/queries/item-sprites';
import type { RuleTileSpec, TileState } from '../RulesTab.type';

type RuleTileProps = {
  spec: RuleTileSpec;
  checked: boolean;
  /** The category is off: the tile draws inert and this sentence is its tooltip. */
  reason?: string;
  onChange: (on: boolean) => void;
};

const PLACEHOLDER = <Box className="cheats-rules__sprite cheats-rules__sprite--placeholder" />;

const stateOf = (disabled: boolean, checked: boolean): TileState => {
  if (disabled) return 'disabled';
  return checked ? 'on' : 'off';
};

const RuleTile = (props: RuleTileProps) => {
  const { spec, checked, reason, onChange } = props;
  const { label, name, sprite } = spec;
  const disabled = reason !== undefined;
  const title = reason ?? label;

  return (
    <Box className="cheats-rule" data-state={stateOf(disabled, checked)} title={title}>
      <Checkbox
        className="cheats-rule__control"
        checked={checked}
        ariaLabel={title}
        disabled={disabled}
        onChange={onChange}
        label={(
          <>
            <Image className="cheats-rules__sprite" src={spriteUrlOf(sprite)} alt="" draggable={false} fallback={PLACEHOLDER} />
            <Text className="cheats-rules__name">{name}</Text>
          </>
        )}
      />
    </Box>
  );
};

export { RuleTile };
export type { RuleTileProps };
