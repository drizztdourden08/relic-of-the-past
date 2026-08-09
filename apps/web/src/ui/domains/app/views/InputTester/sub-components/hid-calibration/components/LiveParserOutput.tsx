/* @layer renderer-components @kind component */
/**
 * Shows what the REAL, currently-shipped parser (BaseController.parseReport,
 * via findController) reports for the exact same live bytes the byte grid
 * below is diffing — ground truth from the actual code, not a second guess.
 */
import { Box, Text } from '../../../../../../../design-system/primitives';
import type { DeviceProfile } from '@shared/input';
import type { WebHidInputState } from '../../../../../../../../lib/input/hid-reader';

interface LiveParserOutputProps {
  profile: DeviceProfile | null;
  state: WebHidInputState | null;
}

const LiveParserOutput = (props: LiveParserOutputProps) => {
  const { profile, state } = props;

  if (!state) {
    return (
      <Box className="hid-cal__step hid-cal__live-parser hid-cal__live-parser--none">
        No parser matched this device yet — either nothing in shared/input/data/presets
        recognizes this VID:PID, or no report has arrived from it yet.
      </Box>
    );
  }

  return (
    <Box className="hid-cal__step hid-cal__live-parser">
      <Box className="hid-cal__step-title">Live parser output — {profile?.name ?? 'matched controller'}</Box>
      <Box className="hid-cal__live-parser-row">
        {(profile?.buttons ?? []).map((btn, i) => (
          <Text key={btn.id} className={`hid-cal__live-parser-chip ${state.buttons[i] ? 'hid-cal__live-parser-chip--on' : ''}`}>
            {btn.label}
          </Text>
        ))}
      </Box>
      <Box className="hid-cal__live-parser-row">
        {(profile?.axes ?? []).map((axis, i) => (
          <Text key={axis.id} className="hid-cal__live-parser-chip">
            {axis.label}: {(state.axes[i] ?? 0).toFixed(2)}
          </Text>
        ))}
      </Box>
    </Box>
  );
};

export { LiveParserOutput };
export type { LiveParserOutputProps };
