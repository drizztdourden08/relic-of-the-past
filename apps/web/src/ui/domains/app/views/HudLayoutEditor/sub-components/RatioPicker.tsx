/* @layer renderer-components @kind component */
import { Box } from '@ds/primitives/Box';
import { Button } from '@ds/primitives/Button';
import { Text } from '@ds/primitives/Text';
import { EDITOR_RATIOS } from '../HudLayoutEditor.constants';
import type { RatioPickerProps } from './RatioPicker.type';

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
export type { RatioPickerProps } from './RatioPicker.type';
