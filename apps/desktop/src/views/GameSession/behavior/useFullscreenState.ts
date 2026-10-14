/* @layer renderer-appshell @kind hook */
import { useState, useEffect } from 'react';
import type { WindowControlsPort } from '@drizztdourden08/brock-core';

const useFullscreenState = (win: WindowControlsPort) => {
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    void win.isFullscreen().then(setIsFullscreen);
    return win.onFullscreenChange(setIsFullscreen);
  }, [win]);

  return isFullscreen;
};

export { useFullscreenState };
