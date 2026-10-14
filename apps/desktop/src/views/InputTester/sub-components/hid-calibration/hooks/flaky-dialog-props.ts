/* @layer renderer-components @kind logic */
import type { useFlakyByteWarning } from './useFlakyByteWarning';

const flakyDialogProps = (flakyWarning: ReturnType<typeof useFlakyByteWarning>) => ({
  flakyDialogOpen: flakyWarning.flakyDialogOpen,
  flakyBytes: flakyWarning.flakyBytes,
  flakyLiveRanges: flakyWarning.liveRanges,
  onExcludeFlakyAndContinue: flakyWarning.excludeAndContinue,
  onContinueFlakyAnyway: flakyWarning.continueWithoutExcluding,
  onCancelFlakyDialog: flakyWarning.cancel,
});

export { flakyDialogProps };
