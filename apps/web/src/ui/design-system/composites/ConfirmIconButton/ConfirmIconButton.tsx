/* @layer renderer-components @kind component */
/**
 * An icon action that asks before it runs. At rest it is a single glyph; pressing it swaps
 * in a red cancel and a green confirm, so a one-click action that cannot be undone still
 * takes a deliberate second press without opening a dialog over the page.
 */
import { useCallback, useEffect, useState, type KeyboardEvent } from 'react';
import { Box } from '../../primitives/Box';
import { Icon } from '../../primitives/Icon';
import { IconButton } from '../../primitives/IconButton';
import './ConfirmIconButton.css';
import { type ConfirmIconButtonProps } from './ConfirmIconButton.type';

const CANCEL_PATH = 'M4.5 4.5l7 7M11.5 4.5l-7 7';
const CONFIRM_PATH = 'M3.5 8.5 6.5 11.5 12.5 4.5';

const strokeIcon = (path: string) => (
  <Icon
    size={13}
    paths={[path]}
    fill="none"
    stroke="currentColor"
    strokeWidth={1.8}
    strokeLinecap="round"
    strokeLinejoin="round"
  />
);

const ConfirmIconButton = (props: ConfirmIconButtonProps) => {
  const { icon, label, confirmLabel, cancelLabel, onConfirm, disabled = false, className = '' } = props;
  const [armed, setArmed] = useState(false);

  // A control that goes away mid-question must not come back still holding it.
  useEffect(() => {
    if (disabled) setArmed(false);
  }, [disabled]);

  const handleConfirm = useCallback(() => {
    setArmed(false);
    onConfirm();
  }, [onConfirm]);

  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    if (event.key !== 'Escape') return;
    event.stopPropagation();
    setArmed(false);
  }, []);

  return (
    <Box className={`confirm-icon-btn ${className}`} onKeyDown={handleKeyDown}>
      {!armed && (
        <IconButton label={label} title={label} disabled={disabled} onClick={() => setArmed(true)}>
          {icon}
        </IconButton>
      )}
      {armed && (
        <>
          {/* Arming replaces the button that had focus, so the keyboard lands on the safe half. */}
          <IconButton
            autoFocus
            variant="danger"
            label={cancelLabel}
            title={cancelLabel}
            onClick={() => setArmed(false)}
          >
            {strokeIcon(CANCEL_PATH)}
          </IconButton>
          <IconButton variant="secondary" label={confirmLabel} title={confirmLabel} onClick={handleConfirm}>
            {strokeIcon(CONFIRM_PATH)}
          </IconButton>
        </>
      )}
    </Box>
  );
};

export {
  ConfirmIconButton,
};
