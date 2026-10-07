/* @layer renderer-components @kind component */
/**
 * One titled section of an options panel. The title is the section's only
 * chrome: gold for every group, brighter for a live one, so a section whose
 * rows the player can still change.
 */
import { Box, Text } from '@ds/primitives';
import type { RandomizerOptionGroupProps } from './RandomizerOptionGroup.type';
import './RandomizerOptionGroup.css';

const RandomizerOptionGroup = (props: RandomizerOptionGroupProps) => {
  const { title, live = false, className = '', children } = props;

  return (
    <Box className={`rand-opt-group${live ? ' rand-opt-group--live' : ''}${className ? ` ${className}` : ''}`}>
      <Text className="rand-opt-group__title">{title}</Text>
      {children}
    </Box>
  );
};

export { RandomizerOptionGroup };
