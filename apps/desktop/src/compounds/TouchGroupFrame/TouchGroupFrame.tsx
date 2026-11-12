/* @layer renderer-components @kind component */
import { Icon } from '@drizztdourden08/tessera/primitives';
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
    <div
      className={className}
      style={{ left: rect.left, top: rect.top, width: rect.width, height: rect.height }}
      aria-hidden="true"
    >
      <span className="touch-group-frame__badge">
        <Icon name={locked ? 'lock' : 'lock-open'} />
      </span>
    </div>
  );
};

export { TouchGroupFrame };
