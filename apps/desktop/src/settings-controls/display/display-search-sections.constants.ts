/* @layer renderer-app @kind constants */
import type { Section } from '@drizztdourden08/brock-react';

const WINDOW_SEARCH_SECTION: Section = {
  id: 'display-window',
  title: 'Window',
  items: [
    { key: 'windowMode', label: 'Window mode', description: 'Windowed, borderless or fullscreen.', hint: 'Pick how the window fills the screen. It changes right away.', keywords: 'windowed borderless fullscreen full screen frame' },
    { key: 'displayMonitor', label: 'Screen', description: 'The screen the window uses.', hint: 'Pick a screen for borderless and fullscreen, or follow the screen the window is on.', keywords: 'monitor display screen follow window' },
  ],
};

const REFRESH_SEARCH_SECTION: Section = {
  id: 'display-refresh-rate',
  title: 'Refresh rate',
  items: [
    { key: 'detectedRate', label: 'Detected refresh rate', description: 'The rate the display runs at now.', keywords: 'hz detected current rate monitor' },
    { key: 'syncedRateInFullscreen', label: 'Synced rate in fullscreen', description: 'Switch the display to the target rate while in fullscreen, and back when fullscreen ends.', hint: 'On, fullscreen borrows the target rate and hands the old rate back when it ends. The desktop keeps its own rate.', keywords: 'hz synced sync fullscreen refresh rate' },
    { key: 'syncedRateTargetHz', label: 'Target refresh rate', description: 'The rate the synced mode and the change button use.', hint: 'Pick a rate the display offers. A multiple of 60 suits content made at 60 frames a second.', keywords: 'hz target 60 120 144 240 refresh rate' },
    { key: 'changeRate', label: 'Change refresh rate', description: 'Set the display to the target rate now and leave it there.', keywords: 'hz change apply set refresh rate' },
  ],
};

export { WINDOW_SEARCH_SECTION, REFRESH_SEARCH_SECTION };
