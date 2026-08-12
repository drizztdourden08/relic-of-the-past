/* @layer renderer-components @kind component */
/**
 * Usage instructions for the HID Calibration Wizard — how to read the byte
 * grid and avoid binding a button to the wrong (or noisy) byte. Open by
 * default (still collapsible) because most calibration mistakes come from
 * skipping this.
 */
import { Box, Text } from '../../../../../../../design-system/primitives';

const InstructionsPanel = () => {
  return (
    <Box as="details" className="hid-cal__step hid-cal__instructions" open>
      <Box as="summary" className="hid-cal__step-title">How to calibrate — read this first</Box>
      <Box as="ol" className="hid-cal__instructions-list">
        <Box as="li">
          Watch the byte grid below while you move the controller. Every byte that changes gets a color:
          Stick, Trigger, Button, or just "Changed" if nothing has claimed it yet.
        </Box>
        <Box as="li">
          Some bytes move constantly for reasons unrelated to what you're detecting — timers, counters,
          gyro noise. <Text as="strong" className="hid-cal__instructions-hl">Click a byte cell to toggle it Excluded</Text> so
          every detector skips it.
        </Box>
        <Box as="li">
          To bind a button: press and hold it, then check which byte actually changed.{' '}
          <Text as="strong" className="hid-cal__instructions-hl--warn">If a second, unrelated byte is also changing
          at the same time, something is conflicting</Text> — exclude that byte before binding.
        </Box>
        <Box as="li">
          Only confirm the bind once you're sure no unrelated "idle" byte is changing alongside the one
          you expect.
        </Box>
        <Box as="li">
          If a bound button doesn't work afterward, hold it again and watch the byte grid.{' '}
          <Text as="strong" className="hid-cal__instructions-hl--warn">Triggers especially rest near a dead zone
          and fluctuate slightly even when untouched</Text> — that can get misread as noise and excluded by mistake.
        </Box>
      </Box>
      <Box className="hid-cal__instructions-alert">
        Most failed calibrations come from an unexcluded noisy byte, not a wrong bind — check the grid first.
      </Box>
    </Box>
  );
};

export { InstructionsPanel };
