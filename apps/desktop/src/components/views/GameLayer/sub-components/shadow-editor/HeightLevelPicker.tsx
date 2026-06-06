import { useShadowEditorStore } from '../../../../../stores/shadow-editor-store';
import './HeightLevelPicker.css';

interface HeightLevelPickerProps {
  value: number;
  onChange: (value: number) => void;
}

const HeightLevelPicker = ({ value, onChange }: HeightLevelPickerProps) => {
  const heightLevels = useShadowEditorStore((s) => s.heightLevels);

  return (
    <div className="height-level-picker">
      {heightLevels.map((level, i) => {
        const active = Math.abs(value - level.value) < 0.005;
        return (
          <button
            key={i}
            type="button"
            className={`height-level-picker__btn${active ? ' height-level-picker__btn--active' : ''}`}
            onClick={() => onChange(level.value)}
            title={`${level.label} (${level.value})`}
          >
            <span
              className="height-level-picker__swatch"
              style={{ opacity: level.value }}
            />
            <span className="height-level-picker__label">{level.label}</span>
          </button>
        );
      })}
    </div>
  );
};

export { HeightLevelPicker };
