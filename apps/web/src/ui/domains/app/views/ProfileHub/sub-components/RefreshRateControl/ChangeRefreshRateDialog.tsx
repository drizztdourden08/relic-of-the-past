/* @layer renderer-components @kind component */
/**
 * Confirms changing the display's refresh rate for good.
 *
 * Worth a dialog because it reaches outside the game and changes a system setting. The wording
 * covers the three things a player needs to know before saying yes: it lasts, how to undo it,
 * and that there is a temporary alternative if they would rather not.
 */
import { Dialog } from '../../../../../../design-system/composites/Dialog';
import { Box } from '../../../../../../design-system/primitives/Box';
import { Text } from '../../../../../../design-system/primitives/Text';
import './RefreshRateControl.css';

interface ChangeRefreshRateDialogProps {
  open: boolean;
  targetHz: number;
  currentHz: number | null;
  onConfirm: () => void;
  onCancel: () => void;
}

const ChangeRefreshRateDialog = (props: ChangeRefreshRateDialogProps) => {
  const { open, targetHz, currentHz, onConfirm, onCancel } = props;
  const from = currentHz !== null ? `${Math.round(currentHz)} Hz` : 'its current rate';

  return (
    <Dialog
      open={open}
      title={`Change your display to ${targetHz} Hz?`}
      message={`This changes your display from ${from} to ${targetHz} Hz and leaves it there. Your screen will go black for a second while it switches.`}
      confirmLabel={`Change to ${targetHz} Hz`}
      cancelLabel="Cancel"
      onConfirm={onConfirm}
      onCancel={onCancel}
    >
      <Box className="refresh-rate__dialog-body">
        <Text className="refresh-rate__dialog-line">
          The change is not permanent in the sense that you are stuck with it. It stays until
          something changes it back, and you can undo it at any time either by picking a different
          rate here, or from your operating system’s own display settings.
        </Text>
        <Text className="refresh-rate__dialog-line">
          If you would rather leave your desktop alone, cancel this and turn on “Set Synced Refresh
          Rate in full screen” instead. That borrows the rate only while the game is in fullscreen
          and hands your original rate straight back when you leave it — but it does nothing while
          you play in a window.
        </Text>
        <Text className="refresh-rate__dialog-line">
          Other windows and apps may move or resize when the rate changes, and a few displays take
          a moment to settle.
        </Text>
      </Box>
    </Dialog>
  );
};

export { ChangeRefreshRateDialog };
export type { ChangeRefreshRateDialogProps };
