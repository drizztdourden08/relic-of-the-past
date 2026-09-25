/* @layer renderer-components @kind component */
/**
 * Which display the layout is being judged on.
 *
 * The stage re-runs the SAME layout pass at the chosen aspect, with nothing
 * scaled or letterboxed to fake it, so a group that only clears the vitals at
 * 21:9, or a wallet that falls off the bottom at 4:3, is visible while it is
 * being authored instead of after a resize in play.
 *
 * A row of chips, not a select, because the whole point is to flick
 * between them and watch what moves.
 */
import { Box } from '@ds/primitives/Box';
import { Button } from '@ds/primitives/Button';
import { Text } from '@ds/primitives/Text';
import { EDITOR_RATIOS } from '../HudLayoutEditor.constants';

interface RatioPickerProps {
  value: string;
  onChange: (id: string) => void;
}

const RatioPicker = (props: RatioPickerProps) => {
  const { value, onChange } = props;

  return (
    <Box className="hud-toolbar__field">
      <Text className="hud-toolbar__field-label">Ratio</Text>
      <Box className="hud-toolbar__chips">
        {EDITOR_RATIOS.map((ratio) => (
          <Button
            key={ratio.id}
            variant="bare"
            className={`hud-toolbar__chip${ratio.id === value ? ' is-selected' : ''}`}
            aria-pressed={ratio.id === value}
            title={`${ratio.view.w} x ${ratio.view.h} game pixels`}
            onClick={() => onChange(ratio.id)}
          >
            {ratio.label}
          </Button>
        ))}
      </Box>
    </Box>
  );
};

export { RatioPicker };
export type { RatioPickerProps };
