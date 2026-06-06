/* @layer renderer-components @kind component */
﻿import { useRef, useState, useEffect, useCallback } from 'react';
import './SegmentedControl.css';
import { type SegmentOption, type SegmentedControlProps } from './types';



const SegmentedControl = <T extends string = string>(props: SegmentedControlProps<T>) => {
  const {
    value,
    options,
    onChange,
    label,
    description,
    disabled = false,
  } = props;

  const trackRef = useRef<HTMLDivElement>(null);
  const [indicatorStyle, setIndicatorStyle] = useState<React.CSSProperties>({});

  const updateIndicator = useCallback(() => {
    const track = trackRef.current;
    if (!track) return;
    const activeBtn = track.querySelector<HTMLButtonElement>('[aria-checked="true"]');
    if (!activeBtn) return;
    setIndicatorStyle({
      width: activeBtn.offsetWidth,
      transform: `translateX(${activeBtn.offsetLeft - 2}px)`,
    });
  }, []);

  useEffect(() => {
    updateIndicator();
  }, [value, options, updateIndicator]);

  // Re-measure on resize
  useEffect(() => {
    const observer = new ResizeObserver(updateIndicator);
    if (trackRef.current) observer.observe(trackRef.current);
    return () => observer.disconnect();
  }, [updateIndicator]);

  return (
    <div className={`segmented ${disabled ? 'segmented--disabled' : ''}`}>
      {(label || description) && (
        <div className="segmented__header">
          {label && <span className="segmented__label">{label}</span>}
          {description && <span className="segmented__description">{description}</span>}
        </div>
      )}
      <div className="segmented__track" role="radiogroup" aria-label={label} ref={trackRef}>
        <span
          className="segmented__indicator"
          style={indicatorStyle}
        />
        {options.map((opt) => (
          <button
            key={opt.value}
            type="button"
            role="radio"
            aria-checked={value === opt.value}
            className={`segmented__btn ${value === opt.value ? 'segmented__btn--active' : ''}`}
            onClick={() => onChange(opt.value)}
            disabled={disabled || opt.disabled}
          >
            {opt.label}
          </button>
        ))}
      </div>
    </div>
  );
};

export {
  SegmentedControl,
};
