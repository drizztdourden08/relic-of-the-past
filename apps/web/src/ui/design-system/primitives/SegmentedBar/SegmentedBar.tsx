/* @layer renderer-components @kind component */
/**
 * A thin bar split into coloured parts, each as wide as its share of the whole. The widths
 * are the data, so they stay inline styles; the colours come from the series tokens.
 */
import type { SegmentedBarProps } from './SegmentedBar.type';
import './SegmentedBar.css';

const sumOf = (values: readonly number[]): number => values.reduce((sum, value) => sum + value, 0);

const widthOf = (value: number, max: number): string => (max > 0 ? `${(value / max) * 100}%` : '0%');

const SegmentedBar = (props: SegmentedBarProps) => {
  const { segments, max, className = '' } = props;
  const full = max ?? sumOf(segments.map((segment) => segment.value));

  return (
    <div className={`segmented-bar${className ? ` ${className}` : ''}`}>
      {segments.map((segment) => (
        <div
          key={segment.key}
          className="segmented-bar__seg"
          data-series={segment.tone}
          style={{ width: widthOf(segment.value, full) }}
        />
      ))}
    </div>
  );
};

export { SegmentedBar };
