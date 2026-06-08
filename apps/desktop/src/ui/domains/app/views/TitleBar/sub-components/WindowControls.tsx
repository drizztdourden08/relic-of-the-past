/* @layer renderer-components @kind component */
import { useState, useEffect } from 'react';
import { Box } from '../../../../../design-system/primitives/Box';
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
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    window.api.isFullscreen().then(setIsFullscreen);
    return window.api.onFullscreenChange(setIsFullscreen);
  }, []);

  return (
    <Box className="titlebar__right">
      <Box
        as="button"
        className="titlebar__control"
        onClick={() => window.api.toggleFullscreen()}
        aria-label={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
      >
        <Icon paths={isFullscreen ? FULLSCREEN_EXIT_PATHS : FULLSCREEN_ENTER_PATHS} size={12} />
      </Box>
      <Box
        as="button"
        className="titlebar__control"
        onClick={() => window.api.minimize()}
        aria-label="Minimize"
      >
        <Icon paths={MINIMIZE_PATHS} size={12} viewBox="0 0 12 12" />
      </Box>
      <Box
        as="button"
        className="titlebar__control"
        onClick={() => window.api.maximize()}
        aria-label={isMaximized ? 'Restore' : 'Maximize'}
      >
        <Icon paths={isMaximized ? RESTORE_PATHS : MAXIMIZE_PATHS} size={12} viewBox="0 0 12 12" />
      </Box>
      <Box
        as="button"
        className="titlebar__control titlebar__control--close"
        onClick={() => window.api.close()}
        aria-label="Close"
      >
        <Icon paths={CLOSE_PATHS} size={12} viewBox="0 0 12 12" />
      </Box>
    </Box>
  );
};

export { WindowControls };
