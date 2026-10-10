/* @layer renderer-components @kind component */
import { Box, Pressable, Text } from '@drizztdourden08/tessera/primitives';
import { useShadowEditorStore } from '../../../../../stores/shadow-editor-store';
import type { HeightLevelPickerProps } from './HeightLevelPicker.type';
import './HeightLevelPicker.css';

const HeightLevelPicker = ({ value, onChange }: HeightLevelPickerProps) => {
  const heightLevels = useShadowEditorStore((s) => s.heightLevels);

  return (
    <Box className="height-level-picker">
      {heightLevels.map((level, i) => {
        const active = Math.abs(value - level.value) < 0.005;
        return (
          <Pressable
            key={i}
            className={`height-level-picker__btn${active ? ' height-level-picker__btn--active' : ''}`}
            aria-pressed={active}
            onClick={() => onChange(level.value)}
            title={`${level.label} (${level.value})`}
          >
            <Box
              className="height-level-picker__swatch"
              style={{ opacity: level.value }}
            />
            <Text className="height-level-picker__label">{level.label}</Text>
          </Pressable>
        );
      })}
    </Box>
  );
};

export { HeightLevelPicker };
