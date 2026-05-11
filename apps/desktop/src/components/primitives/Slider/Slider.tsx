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
}: SliderProps) {
  const pct = ((value - min) / (max - min)) * 100;

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
