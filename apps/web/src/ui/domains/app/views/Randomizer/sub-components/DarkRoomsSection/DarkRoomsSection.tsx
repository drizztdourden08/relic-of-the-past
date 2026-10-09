/* @layer renderer-components @kind component */
import { useCallback } from 'react';
import { Box, Callout, Text } from '@drizztdourden08/tessera/primitives';
import { RandomizerOptionGroup } from '@domains/app/compounds/RandomizerOptionGroup';
import { RandomizerOptionRow } from '@domains/app/compounds/RandomizerOptionRow';
import type { OptionValue } from '@shared/randomizer/world/options.type';
import type { DarkRoomLightField } from '@shared/randomizer/world/dark-rooms/dark-room.type';
import { useDarkRoomLightTiles } from './behavior/useDarkRoomLightTiles';
import { DarkRoomLightTile } from './sub-components/DarkRoomLightTile';
import { BLIND_NOTE, DARK_ROOMS_TITLE, DARK_ROOM_REQUIRED_OPTION, LIGHTS_LABEL } from './DarkRoomsSection.constants';
import type { DarkRoomsSectionProps } from './DarkRoomsSection.type';
import './DarkRoomsSection.css';

const DarkRoomsSection = (props: DarkRoomsSectionProps) => {
  const { setting, impact, forced, onChange } = props;
  const readOnly = onChange === undefined;
  const tiles = useDarkRoomLightTiles(setting.lights, forced);
  const reasons = tiles.filter((tile) => tile.reason !== undefined);
  const rolledBlind = setting.requireLight && tiles.every((tile) => !tile.checked);
  const changeRequirement = useCallback(
    (next: OptionValue) => onChange?.({ ...setting, requireLight: Boolean(next) }),
    [onChange, setting],
  );
  const changeLight = useCallback(
    (field: DarkRoomLightField, checked: boolean) => onChange?.({
      ...setting, lights: { ...setting.lights, [field]: checked },
    }),
    [onChange, setting],
  );

  return (
    <RandomizerOptionGroup title={DARK_ROOMS_TITLE} live className="dark-rooms">
      {DARK_ROOM_REQUIRED_OPTION !== undefined && (
        <RandomizerOptionRow
          option={DARK_ROOM_REQUIRED_OPTION}
          value={setting.requireLight}
          impact={impact}
          readout={readOnly}
          onChange={readOnly ? undefined : changeRequirement}
        />
      )}
      <Text className="dark-rooms__label">{LIGHTS_LABEL}</Text>
      <Box className="dark-rooms__tiles">
        {tiles.map((tile) => (
          <DarkRoomLightTile
            key={tile.field}
            tile={tile}
            disabled={readOnly}
            readout={readOnly}
            onChange={readOnly ? undefined : changeLight}
          />
        ))}
      </Box>
      {reasons.map((tile) => (
        <Text key={tile.field} className="dark-rooms__reason">{`${tile.name} ${tile.reason}`}</Text>
      ))}
      {rolledBlind && <Callout tone="primary" className="dark-rooms__banner">{BLIND_NOTE}</Callout>}
    </RandomizerOptionGroup>
  );
};

export { DarkRoomsSection };
