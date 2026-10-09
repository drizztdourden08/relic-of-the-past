/* @layer renderer-components @kind component */
import { useCallback, useMemo, useState } from 'react';
import { isSyncedRate } from '@shared/display/refresh-rate';
import { Box, Text, Button, SegmentedControl } from '@drizztdourden08/tessera/primitives';
import { ChangeRefreshRateDialog } from './sub-components/ChangeRefreshRateDialog';
import { useApplyRefreshRate } from './behavior/useApplyRefreshRate';
import type { RefreshRateControlProps } from './RefreshRateControl.type';
import './RefreshRateControl.css';

const RefreshRateControl = (props: RefreshRateControlProps) => {
  const { status, detectedHz, value, onChange } = props;
  const [dialogOpen, setDialogOpen] = useState(false);
  const { apply, applying, result } = useApplyRefreshRate();

  const rates = status.availableRates;
  const selected = value > 0 && rates.includes(value) ? value : rates.at(-1) ?? value;
  const currentHz = detectedHz ?? result?.currentHz ?? status.currentHz;
  const compatible = isSyncedRate(currentHz);

  const options = useMemo(() => rates.map((hz) => ({ value: String(hz), label: `${hz} Hz` })), [rates]);
  const handleChange = useCallback((v: string) => onChange(Number(v)), [onChange]);
  const openDialog = useCallback(() => setDialogOpen(true), []);
  const closeDialog = useCallback(() => setDialogOpen(false), []);
  const confirmDialog = useCallback(() => {
    setDialogOpen(false);
    void apply(selected);
  }, [apply, selected]);

  return (
    <Box className="refresh-rate">
      <SegmentedControl
        label="Target Refresh Rate"
        value={String(selected)}
        options={options}
        onChange={handleChange}
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
            onClick={openDialog}
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
        onCancel={closeDialog}
        onConfirm={confirmDialog}
      />
    </Box>
  );
};

export { RefreshRateControl };
export type { RefreshRateControlProps };
