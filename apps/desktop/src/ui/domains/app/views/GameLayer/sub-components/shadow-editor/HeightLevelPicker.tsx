/* @layer renderer-components @kind component */
import { Box } from '../../../../../../design-system/primitives/Box';
import { Button } from '../../../../../../design-system/primitives/Button';
import { Text } from '../../../../../../design-system/primitives/Text';
import { useShadowEditorStore } from '../../../../../../../stores/shadow-editor-store';
import './HeightLevelPicker.css';

interface HeightLevelPickerProps {
  value: number;
  onChange: (value: number) => void;
}

const HeightLevelPicker = ({ value, onChange }: HeightLevelPickerProps) => {
  const heightLevels = useShadowEditorStore((s) => s.heightLevels);

  return (
    <Box className="height-level-picker">
      {heightLevels.map((level, i) => {
        const active = Math.abs(value - level.value) < 0.005;
        return (
          <Button
            variant="bare"
            key={i}
            className={`height-level-picker__btn${active ? ' height-level-picker__btn--active' : ''}`}
            onClick={() => onChange(level.value)}
            title={`${level.label} (${level.value})`}
          >
            <Box
              className="height-level-picker__swatch"
              style={{ opacity: level.value }}
            />
            <Text className="height-level-picker__label">{level.label}</Text>
          </Button>
        );
      })}
    </Box>
  );
};

export { HeightLevelPicker };
