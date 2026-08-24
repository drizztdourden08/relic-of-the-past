/* @layer renderer-components @kind component */
/**
 * DisabledOverlay — disabled-state cover for any setting-gated surface (a Vanilla-Safe-locked
 * control, a widget whose master toggle is off, a binding list for a disabled feature). Unlike
 * developer mode (which hides its surfaces outright), this keeps the content visible under a
 * translucent scrim, states why it's disabled, and links back to the setting that would
 * re-enable it — so nothing the player relies on silently disappears.
 */
import { Box } from '../../primitives/Box';
import { Text } from '../../primitives/Text';
import { Button } from '../../primitives/Button';
import './DisabledOverlay.css';
import { DISABLED_SETTING_MESSAGES } from './DisabledOverlay.constants';
import type { DisabledOverlayProps } from './DisabledOverlay.type';

// SettingsLayout's Vanilla-Safe-only lock is the sole caller that never passes an explicit
// `message` (every one of its locks has the same cause), so its default comes straight out of
// the shared lookup rather than a second hardcoded copy of the same string.
const DEFAULT_MESSAGE = DISABLED_SETTING_MESSAGES.vanillaSafe;
const DEFAULT_ACTION_LABEL = 'Open Settings';

const DisabledOverlay = (props: DisabledOverlayProps) => {
  const {
    active, message = DEFAULT_MESSAGE, actionLabel = DEFAULT_ACTION_LABEL,
    contained = false, onOpenSettings, children, className = '',
  } = props;

  if (!active) return <>{children}</>;

  const rootClassName = ['disabled-overlay', contained && 'disabled-overlay--contained', className]
    .filter(Boolean)
    .join(' ');

  return (
    <Box className={rootClassName}>
      {/* Layout-neutral anchor: no padding, margin, border or background of its own, so the
       *  covered content keeps exactly the layout it would have on its own. `inert` drops this
       *  subtree from focus, tab order, and the a11y tree — the scrim's own message is what a
       *  screen reader should announce instead. */}
      <Box className="disabled-overlay__content" aria-disabled="true" inert>
        {children}
      </Box>
      <Box className="disabled-overlay__scrim">
        <Text className="disabled-overlay__message">{message}</Text>
        {onOpenSettings && (
          <Button variant="secondary" size="sm" onClick={onOpenSettings}>{actionLabel}</Button>
        )}
      </Box>
    </Box>
  );
};

export { DisabledOverlay };
