/* @layer renderer-components @kind component */
import { Box, Icon } from '@drizztdourden08/tessera/primitives';
import './TouchGroupFrame.css';
import type { TouchGroupFrameProps } from './TouchGroupFrame.type';

const TouchGroupFrame = (props: TouchGroupFrameProps) => {
  const { rect, locked, selected } = props;
  const className = [
    'touch-group-frame',
    locked ? 'touch-group-frame--locked' : '',
    selected ? 'touch-group-frame--selected' : '',
  ].filter(Boolean).join(' ');

  return (
    <Box
      className={className}
      style={{ left: rect.left, top: rect.top, width: rect.width, height: rect.height }}
      aria-hidden="true"
    >
      <Box className="touch-group-frame__badge">
        <Icon name={locked ? 'lock' : 'lock-open'} />
      </Box>
    </Box>
  );
};

export { TouchGroupFrame };
