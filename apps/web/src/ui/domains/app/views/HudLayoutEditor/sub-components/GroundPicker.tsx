/* @layer renderer-components @kind component */
/**
 * Which surface the HUD is being arranged over.
 *
 * Five flat grounds cut from the game itself (turf, an indoor floor, sand, and
 * water at two depths), tiled behind the stage. It matters more than it sounds:
 * two defects in one week were "invisible against the background it was
 * actually drawn on", a silhouette that was black on black and a dimmed chip
 * that vanished over grass. Arranging over a real surface makes that whole
 * class of mistake visible while the arrangement is being made.
 *
 * Each swatch is the tile itself, not a colour, so the choice is made by
 * recognising the ground instead of by reading its name.
 */
import { Box } from '@ds/primitives/Box';
import { Button } from '@ds/primitives/Button';
import { Text } from '@ds/primitives/Text';
import { getSpritesBase } from '@shared/game/logic/queries/item-sprites';
import { EDITOR_GROUNDS } from '../HudLayoutEditor.constants';

interface GroundPickerProps {
  value: string;
  onChange: (file: string) => void;
}

const GroundPicker = (props: GroundPickerProps) => {
  const { value, onChange } = props;
  const base = getSpritesBase();

  return (
    <Box className="hud-toolbar__field">
      <Text className="hud-toolbar__field-label">Ground</Text>
      <Box className="hud-toolbar__chips">
        {EDITOR_GROUNDS.map((ground) => (
          <Button
            key={ground.file}
            variant="bare"
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
export type { GroundPickerProps };
