/* @layer renderer-components @kind component */
/**
 * One titled section of an options panel. The title is the section's only
 * chrome: gold for every group, brighter for a live one — a section whose
 * rows the player can still change. Given `onToggle`, the group folds: the
 * title becomes a button with a chevron and the row count, and the rows
 * render only while open.
 */
import { Box, Button, Text } from '@ds/primitives';
import type { RandomizerOptionGroupProps } from './RandomizerOptionGroup.type';
import './RandomizerOptionGroup.css';

const RandomizerOptionGroup = (props: RandomizerOptionGroupProps) => {
  const { title, live = false, onToggle, open = true, count, className = '', children } = props;
  const heading = <Text className="rand-opt-group__title">{title}</Text>;

  return (
    <Box className={`rand-opt-group${live ? ' rand-opt-group--live' : ''}${className ? ` ${className}` : ''}`}>
      {onToggle === undefined ? heading : (
        <Button variant="bare" className="rand-opt-group__toggle" onClick={onToggle}>
          <Text className="rand-opt-group__chevron">{open ? '▼' : '▶'}</Text>
          {heading}
          {count !== undefined && <Text className="rand-opt-group__count">{count}</Text>}
        </Button>
      )}
      {(onToggle === undefined || open) && children}
    </Box>
  );
};

export { RandomizerOptionGroup };
