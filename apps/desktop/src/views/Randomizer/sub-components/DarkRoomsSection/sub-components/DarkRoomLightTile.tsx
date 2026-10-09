/* @layer renderer-components @kind component */
import { useCallback } from 'react';
import { Box, Checkbox, Image } from '@drizztdourden08/tessera/primitives';
import { OptionValueTag } from '@app/compounds/OptionValueTag';
import type { DarkRoomLightTileProps } from './DarkRoomLightTile.type';
import './DarkRoomLightTile.css';

const placeholderArt = <Box className="dark-room-light__sprite dark-room-light__sprite--placeholder" />;

const tileStateOf = (disabled: boolean, forced: boolean, checked: boolean): string => {
  if (disabled) return 'disabled';
  if (forced) return 'forced';
  return checked ? 'on' : 'off';
};

const DarkRoomLightTile = (props: DarkRoomLightTileProps) => {
  const { tile, disabled, readout = false, onChange } = props;
  const { field, name, sprite, checked, reason } = tile;
  const forced = reason !== undefined;
  const title = forced ? `${name} ${reason}` : name;
  const handleChange = useCallback((next: boolean) => onChange?.(field, next), [onChange, field]);
  const art = sprite === undefined ? placeholderArt : (
    <Image className="dark-room-light__sprite" src={sprite} alt="" draggable={false} fallback={placeholderArt} />
  );

  return (
    <Box className="dark-room-light" data-state={tileStateOf(disabled, forced, checked)} title={title}>
      {readout ? <OptionValueTag className="dark-room-light__readout" label={art} value={checked} /> : (
        <Checkbox
          className="dark-room-light__control"
          checked={checked}
          ariaLabel={title}
          disabled={disabled || forced || onChange === undefined}
          onChange={handleChange}
          label={art}
        />
      )}
    </Box>
  );
};

export { DarkRoomLightTile };
export type { DarkRoomLightTileProps };
