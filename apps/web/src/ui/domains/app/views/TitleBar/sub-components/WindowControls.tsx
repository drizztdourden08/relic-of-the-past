/* @layer renderer-components @kind component */
import { useState, useEffect } from 'react';
import { usePlatform } from '@app/platform';
import { Box } from '../../../../../design-system/primitives/Box';
import { Button } from '../../../../../design-system/primitives/Button';
import { Icon } from '../../../../../design-system/primitives/Icon';
import {
  FULLSCREEN_EXIT_PATHS, FULLSCREEN_ENTER_PATHS, MINIMIZE_PATHS,
  RESTORE_PATHS, MAXIMIZE_PATHS, CLOSE_PATHS,
} from './WindowControls.constants';

interface WindowControlsProps {
  isMaximized: boolean;
}

const WindowControls = (props: WindowControlsProps) => {
  const { isMaximized } = props;
  const { window: win } = usePlatform();
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    win.isFullscreen().then(setIsFullscreen);
    return win.onFullscreenChange(setIsFullscreen);
  }, [win]);

  return (
    <Box className="titlebar__right">
      <Button
        variant="bare"
        className="titlebar__control"
        onClick={() => win.toggleFullscreen()}
        aria-label={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
      >
        <Icon paths={isFullscreen ? FULLSCREEN_EXIT_PATHS : FULLSCREEN_ENTER_PATHS} size={12} />
      </Button>
      <Button
        variant="bare"
        className="titlebar__control"
        onClick={() => win.minimize()}
        aria-label="Minimize"
      >
        <Icon paths={MINIMIZE_PATHS} size={12} viewBox="0 0 12 12" />
      </Button>
      <Button
        variant="bare"
        className="titlebar__control"
        onClick={() => win.toggleMaximize()}
        aria-label={isMaximized ? 'Restore' : 'Maximize'}
      >
        <Icon paths={isMaximized ? RESTORE_PATHS : MAXIMIZE_PATHS} size={12} viewBox="0 0 12 12" />
      </Button>
      <Button
        variant="bare"
        className="titlebar__control titlebar__control--close"
        onClick={() => win.close()}
        aria-label="Close"
      >
        <Icon paths={CLOSE_PATHS} size={12} viewBox="0 0 12 12" />
      </Button>
    </Box>
  );
};

export { WindowControls };
