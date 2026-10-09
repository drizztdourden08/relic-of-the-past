/* @layer renderer-widgets @kind component */
import { Box, Button, Image, Text } from '@drizztdourden08/tessera/primitives';
import { spriteUrlOf } from '@shared/game/logic/queries/item-sprites';
import { SpritePlaceholder } from './SpritePlaceholder';
import type { RungTileProps, TileState } from '../RulesTab.type';

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
        <Image className="cheats-rules__sprite" src={spriteUrlOf(sprite)} alt="" draggable={false} fallback={<SpritePlaceholder />} />
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
