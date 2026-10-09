/* @layer renderer-components @kind component */
import { Box, Pressable, Text } from '@drizztdourden08/tessera/primitives';
import { getSpritesBase } from '@rotp/game-data';
import { EDITOR_GROUNDS } from '../HudLayoutEditor.constants';
import type { GroundPickerProps } from './GroundPicker.type';

const GroundPicker = (props: GroundPickerProps) => {
  const { value, onChange } = props;
  const base = getSpritesBase();

  return (
    <Box className="hud-toolbar__field">
      <Text className="hud-toolbar__field-label">Ground</Text>
      <Box className="hud-toolbar__chips">
        {EDITOR_GROUNDS.map((ground) => (
          <Pressable
            key={ground.file}
            className={`hud-ground__swatch${ground.file === value ? ' is-selected' : ''}`}
            aria-pressed={ground.file === value}
            aria-label={ground.label}
            title={ground.label}
            style={{ backgroundImage: `url("${base}${ground.file}.png")` }}
            onClick={() => onChange(ground.file)}
          />
        ))}
      </Box>
    </Box>
  );
};

export { GroundPicker };
export type { GroundPickerProps } from './GroundPicker.type';
