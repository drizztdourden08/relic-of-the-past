/* @layer renderer-components @kind component */
/**
 * The key to a series chart: one entry per series, its colour dot, label and count, then an
 * optional total. Inline for a line under a bar, stacked for a column of rows that read like
 * a small table. The colours come from the series tokens, so a legend under a SegmentedBar
 * matches its segments by tone.
 */
import { Box } from '../../primitives/Box';
import type { LegendProps } from './Legend.type';
import './Legend.css';

const Legend = (props: LegendProps) => {
  const { entries, total, variant = 'inline', className = '' } = props;

  return (
    <Box className={`legend legend--${variant}${className ? ` ${className}` : ''}`}>
      {entries.map((entry) => (
        <Box key={entry.key} className="legend__entry" data-series={entry.tone} title={entry.title}>
          <Box as="span" className="legend__dot" />
          <Box as="span" className="legend__label">{entry.label}</Box>
          <Box as="span" className="legend__value">{entry.value}</Box>
        </Box>
      ))}
      {total && (
        <Box className="legend__entry legend__entry--total" title={total.title}>
          <Box as="span" className="legend__dot legend__dot--none" />
          <Box as="span" className="legend__label">{total.label}</Box>
          <Box as="span" className="legend__value">{total.value}</Box>
        </Box>
      )}
    </Box>
  );
};

export { Legend };
