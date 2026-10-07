/* @layer renderer-components @kind component */
/**
 * Target refresh-rate picker, plus the state of the display right now and a way to change it
 * for good.
 *
 * Two routes to the same end are deliberately kept side by side: the fullscreen toggle above
 * borrows the rate only while fullscreen and hands it straight back, while "Change refresh
 * rate" sets it and leaves it. Players who dislike the blink on entering fullscreen want the
 * second; players who want their desktop untouched want the first.
 */
import { useState } from 'react';
import type { SyncedRateStatus } from '@shared/types/display';
import { isSyncedRate } from '@shared/display/refresh-rate';
import { Box } from '../../../../../../design-system/primitives/Box';
import { Text } from '../../../../../../design-system/primitives/Text';
import { Button } from '../../../../../../design-system/primitives/Button';
import { SegmentedControl } from '../../../../../../design-system/primitives/SegmentedControl';
import { ChangeRefreshRateDialog } from './ChangeRefreshRateDialog';
import { useApplyRefreshRate } from './useApplyRefreshRate';
import './RefreshRateControl.css';

interface RefreshRateControlProps {
  status: SyncedRateStatus;
  /** Rate detected right now, which may be finer-grained than what the OS reports. */
  detectedHz: number | null;
  /** Stored preference. 0 means "the highest multiple of 60 available". */
  value: number;
  onChange: (hz: number) => void;
}

const RefreshRateControl = (props: RefreshRateControlProps) => {
  const { status, detectedHz, value, onChange } = props;
  const [dialogOpen, setDialogOpen] = useState(false);
  const { apply, applying, result } = useApplyRefreshRate();

  const rates = status.availableRates;
  // A stored rate the display no longer offers would leave nothing selected, so fall back to
  // the highest, which is also what the default of 0 resolves to.
  const selected = value > 0 && rates.includes(value) ? value : rates[rates.length - 1];
  // The detected value leads: it comes from the shared store, which is re-read after a switch,
  // so it is the only one of the three guaranteed to reflect the display as it is now. The
  // host status behind it is only fetched when the preference changes and goes stale the
  // moment the rate is changed from here.
  const currentHz = detectedHz ?? result?.currentHz ?? status.currentHz;
  const compatible = isSyncedRate(currentHz);

  return (
    <Box className="refresh-rate">
      <SegmentedControl
        label="Target Refresh Rate"
        value={String(selected)}
        options={rates.map((hz) => ({ value: String(hz), label: `${hz} Hz` }))}
        onChange={(v) => onChange(Number(v))}
      />

      <Text className="refresh-rate__description">
        The rate the game will ask your display for. Every option here is a multiple of 60, so each
        game frame is shown for exactly the same length of time. Higher is smoother for everything
        else on screen; 60 is the safest if a higher rate ever misbehaves.
      </Text>

      <Box className="refresh-rate__status">
        <Box className="refresh-rate__row">
          <Text className="refresh-rate__current">
            Detected now:
            <Text className="refresh-rate__current-value">
              {currentHz !== null ? `${Math.round(currentHz)} Hz` : 'unknown'}
            </Text>
          </Text>
          <Button
            variant="secondary"
            disabled={!status.supported || !rates.length || applying}
            onClick={() => setDialogOpen(true)}
          >
            {applying ? 'Changing...' : 'Change refresh rate'}
          </Button>
        </Box>
        {!compatible && currentHz !== null && (
          <Text className="refresh-rate__warning">
            {Math.round(currentHz)} Hz is not a multiple of 60. The game runs at 60 frames a second,
            so your display cannot show every frame for the same length of time, so some are held
            longer than others, which looks like stuttering when the screen scrolls.
          </Text>
        )}
        {result?.lastError && (
          <Text className="refresh-rate__warning">{result.lastError}</Text>
        )}
      </Box>

      <ChangeRefreshRateDialog
        open={dialogOpen}
        targetHz={selected}
        currentHz={currentHz}
        onCancel={() => setDialogOpen(false)}
        onConfirm={() => {
          setDialogOpen(false);
          void apply(selected);
        }}
      />
    </Box>
  );
};

export { RefreshRateControl };
export type { RefreshRateControlProps };
