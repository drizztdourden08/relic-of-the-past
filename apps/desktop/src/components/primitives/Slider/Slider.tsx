import { useRef } from 'react';
import './Slider.css';

interface SliderProps {
  value: number;
  min: number;
  max: number;
  step?: number;
  onChange: (value: number) => void;
  label?: string;
  description?: string;
  disabled?: boolean;
  showValue?: boolean;
  formatValue?: (value: number) => string;
  /** Show a mute/unmute button before the slider track */
  mute?: boolean;
  /** Called when the mute button is clicked */
  onMuteToggle?: () => void;
}

export function Slider({
  value,
  min,
  max,
  step = 1,
  onChange,
  label,
  description,
  disabled = false,
  showValue = true,
  formatValue = String,
  mute,
  onMuteToggle,
}: SliderProps) {
  const pct = ((value - min) / (max - min)) * 100;
  const prevVolumeRef = useRef(value || 100);

  // Track previous non-zero value for unmute restore
  if (value > 0) prevVolumeRef.current = value;

  const handleMuteClick = () => {
    if (onMuteToggle) {
      onMuteToggle();
    } else {
      // Default: toggle between 0 and previous value
      onChange(value === 0 ? prevVolumeRef.current : 0);
    }
  };

  return (
    <div className={`slider ${disabled ? 'slider--disabled' : ''}`}>
      {(label || description) && (
        <div className="slider__header">
          <span className="slider__text">
            {label && <span className="slider__label">{label}</span>}
            {description && <span className="slider__description">{description}</span>}
          </span>
        </div>
      )}
      <div className="slider__track">
        {mute != null && (
          <button
            type="button"
            className={`slider__mute ${mute ? 'slider__mute--muted' : ''}`}
            onClick={handleMuteClick}
            aria-label={mute ? 'Unmute' : 'Mute'}
            disabled={disabled}
          >
            {mute ? '🔇' : '🔊'}
          </button>
        )}
        <input
          type="range"
          className="slider__input"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          disabled={disabled}
          style={{ '--slider-pct': `${pct}%` } as React.CSSProperties}
        />
        {showValue && <span className="slider__value">{formatValue(value)}</span>}
      </div>
    </div>
  );
}
