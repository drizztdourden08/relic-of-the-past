/* @layer renderer-app @kind component */
import { ScreenWindow } from '@drizztdourden08/tessera/composites';
import { ScrollArea } from '@drizztdourden08/tessera/primitives';
import { FREE_WINDOW_KEY } from './FreeWindow.constants';
import type { FreeWindowProps } from './FreeWindow.type';
import './FreeWindow.css';

const FreeWindow = (props: FreeWindowProps) => {
  const { title, onClose, size, scroll = false, children } = props;
  return (
    <ScreenWindow title={title} titleRow={false} movable storageKey={FREE_WINDOW_KEY} size={size} onClose={onClose}>
      {scroll ? <ScrollArea className="free-window__scroll">{children}</ScrollArea> : children}
    </ScreenWindow>
  );
};

export { FreeWindow };
