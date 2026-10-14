/* @layer renderer-widgets @kind component */
import { Box, Checkbox, Image, Text } from '@drizztdourden08/tessera/primitives';
import { spriteUrlOf } from '@rotp/game-data';
import { SpritePlaceholder } from './SpritePlaceholder';
import type { RuleTileProps, TileState } from '../RulesTab.type';

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
          <Box className="cheats-rule__face">
            <Image className="cheats-rules__sprite" src={spriteUrlOf(sprite)} alt="" draggable={false} fallback={<SpritePlaceholder />} />
            <Text className="cheats-rules__name">{name}</Text>
          </Box>
        )}
      />
    </Box>
  );
};

export { RuleTile };
