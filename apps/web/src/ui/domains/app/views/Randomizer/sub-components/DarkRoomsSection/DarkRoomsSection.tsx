/* @layer renderer-components @kind component */
/**
 * The dark-room section of an options panel: the requirement, then the items
 * that satisfy it as a row of tiles.
 *
 * A light is an ITEM, so the tile carries it: its own art, a tick, nothing
 * else. The section says what it is for once, at the head, and then only
 * speaks again when something is actually wrong.
 *
 * Two things can be wrong, and they read differently on purpose. A tile a
 * sibling setting holds off carries its reason in the blocking colour, since
 * a control that cannot be moved has to say why. Unticking every light is
 * allowed, but it leaves the requirement above asking for something nothing
 * can meet, so the rule reads unlit rooms as passable and the seed rolls
 * blind: that is not an error, it is a consequence, so it is stated in a
 * banner rather than flagged on a control. The setting handed back on every edit is the STORED one,
 * the mask living in the tiles, so lifting it returns the player's own answer.
 *
 * The run view shares this section, so a stored snapshot reads the same way.
 */
import { Box, Text } from '@ds/primitives';
import { AlertBanner } from '@domains/app/compounds/AlertBanner';
import { RandomizerOptionGroup } from '@domains/app/compounds/RandomizerOptionGroup';
import { RandomizerOptionRow } from '@domains/app/compounds/RandomizerOptionRow';
import { DARK_ROOM_REQUIRED_OPTION } from './behavior/dark-room-option-defs';
import { useDarkRoomLightTiles } from './behavior/useDarkRoomLightTiles';
import { DarkRoomLightTile } from './sub-components/DarkRoomLightTile';
import { BLIND_NOTE, DARK_ROOMS_TITLE, LIGHTS_LABEL } from './DarkRoomsSection.constants';
import type { DarkRoomsSectionProps } from './DarkRoomsSection.type';
import './DarkRoomsSection.css';

const DarkRoomsSection = (props: DarkRoomsSectionProps) => {
  const { setting, impact, forced, onChange } = props;
  const readOnly = onChange === undefined;
  const tiles = useDarkRoomLightTiles(setting.lights, forced);
  const lightsInert = readOnly || !setting.requireLight;
  // A held-off tile only has something to say while a light is asked for at all.
  const reasons = setting.requireLight ? tiles.filter((tile) => tile.reason !== undefined) : [];
  // Asked for a light with none left to count: the seed is rolled blind.
  const blind = setting.requireLight && tiles.every((tile) => !tile.checked);

  return (
    <RandomizerOptionGroup title={DARK_ROOMS_TITLE} live className="dark-rooms">
      {DARK_ROOM_REQUIRED_OPTION !== undefined && (
        <RandomizerOptionRow
          option={DARK_ROOM_REQUIRED_OPTION}
          value={setting.requireLight}
          impact={impact}
          onChange={readOnly
            ? undefined
            : (next) => onChange({ ...setting, requireLight: Boolean(next) })}
        />
      )}
      <Text className="dark-rooms__label">{LIGHTS_LABEL}</Text>
      <Box className="dark-rooms__tiles">
        {tiles.map((tile) => (
          <DarkRoomLightTile
            key={tile.field}
            tile={tile}
            disabled={lightsInert}
            onChange={readOnly ? undefined : (checked) => onChange({
              ...setting, lights: { ...setting.lights, [tile.field]: checked },
            })}
          />
        ))}
      </Box>
      {reasons.map((tile) => (
        <Text key={tile.field} className="dark-rooms__reason">{`${tile.name} ${tile.reason}`}</Text>
      ))}
      {blind && <AlertBanner className="dark-rooms__banner">{BLIND_NOTE}</AlertBanner>}
    </RandomizerOptionGroup>
  );
};

export { DarkRoomsSection };
