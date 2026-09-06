/* @layer renderer-components @kind component */
/**
 * Two-thumb range over a discrete list of stops. Two native range inputs are
 * stacked on one track (so focus, arrows, Home/End and screen readers come
 * for free); only their thumbs take the pointer. The low thumb can never
 * pass the high one — a move that would cross is clamped to the other thumb.
 * When the two thumbs share a stop, the one last moved (or focused) stays on
 * top, so the drag that brought them together can be pulled back; at either
 * end of the track the only thumb that can still move is the one on top.
 */
import { useState } from 'react';
import './RangeSlider.css';
import type { CSSProperties, KeyboardEvent } from 'react';
import type { RangeSliderProps } from './RangeSlider.type';

type Thumb = 'low' | 'high';

const RangeSlider = (props: RangeSliderProps) => {
  const {
    stops, value, onChange, disabled = false, step = 1, labelEvery, ariaLabel, className = '',
  } = props;
  const [low, high] = value;
  const last = Math.max(0, stops.length - 1);
  const percent = (index: number): number => (last === 0 ? 0 : (index / last) * 100);

  const [active, setActive] = useState<Thumb>('high');

  const setLow = (next: number) => {
    setActive('low');
    onChange([Math.min(Math.max(0, next), high), high]);
  };
  const setHigh = (next: number) => {
    setActive('high');
    onChange([low, Math.max(Math.min(last, next), low)]);
  };

  // The native arrows move one stop; a coarser `step` is applied here instead.
  const handleKey = (which: 'low' | 'high') => (event: KeyboardEvent<HTMLInputElement>) => {
    const current = which === 'low' ? low : high;
    const set = which === 'low' ? setLow : setHigh;
    const delta = event.key === 'ArrowRight' || event.key === 'ArrowUp' ? step
      : event.key === 'ArrowLeft' || event.key === 'ArrowDown' ? -step : 0;
    if (delta !== 0) set(current + delta);
    else if (event.key === 'Home') set(0);
    else if (event.key === 'End') set(last);
    else return;
    event.preventDefault();
  };

  const lowOnTop = low === high && (high === last || (low !== 0 && active === 'low'));
  const fill = { '--range-lo': `${percent(low)}%`, '--range-hi': `${percent(high)}%` } as CSSProperties;
  const every = labelEvery ?? 1;
  const ticks = stops
    .map((label, index) => ({ label, index }))
    .filter(({ index }) => index === 0 || index === last || index % every === 0);

  return (
    <div className={`range-slider${disabled ? ' range-slider--disabled' : ''}${className ? ` ${className}` : ''}`}>
      <div className="range-slider__track" style={fill}>
        <input
          type="range"
          className={`range-slider__input${lowOnTop ? ' range-slider__input--top' : ''}`}
          min={0}
          max={last}
          step={1}
          value={low}
          disabled={disabled}
          aria-label={ariaLabel ? `${ariaLabel} start` : 'start'}
          aria-valuetext={stops[low]}
          onChange={(event) => setLow(Number(event.target.value))}
          onFocus={() => setActive('low')}
          onKeyDown={handleKey('low')}
        />
        <input
          type="range"
          className={`range-slider__input${lowOnTop ? '' : ' range-slider__input--top'}`}
          min={0}
          max={last}
          step={1}
          value={high}
          disabled={disabled}
          aria-label={ariaLabel ? `${ariaLabel} end` : 'end'}
          aria-valuetext={stops[high]}
          onChange={(event) => setHigh(Number(event.target.value))}
          onFocus={() => setActive('high')}
          onKeyDown={handleKey('high')}
        />
      </div>
      <div className="range-slider__ticks">
        {ticks.map(({ label, index }) => (
          <span
            key={index}
            className={`range-slider__tick${index >= low && index <= high ? ' range-slider__tick--in' : ''}`}
            style={{ left: `${percent(index)}%` }}
          >
            {label}
          </span>
        ))}
      </div>
    </div>
  );
};

export { RangeSlider };
