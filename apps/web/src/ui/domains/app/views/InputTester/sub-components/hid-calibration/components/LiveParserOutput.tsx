/* @layer renderer-components @kind component */
/**
 * Shows what SDL3's own already-decoded state reports for the exact same
 * live bytes the byte grid below is diffing. Ground truth from the actual
 * transport, not a second guess.
 */
import { Box, Text } from '../../../../../../../design-system/primitives';
import type { DeviceProfile } from '@shared/input';
import type { ControllerInputState } from '../../../../../../../../lib/input/controller-input-store';
import { sdlButtonNameForIndex } from '../diagnostics/sdl-names';

interface LiveParserOutputProps {
  profile: DeviceProfile | null;
  state: ControllerInputState | null;
}

const LiveParserOutput = (props: LiveParserOutputProps) => {
  const { profile, state } = props;

  if (!state) {
    return (
      <Box className="hid-cal__step hid-cal__live-parser hid-cal__live-parser--none">
        Waiting for input.
      </Box>
    );
  }

  return (
    <Box className="hid-cal__step hid-cal__live-parser">
      <Box className="hid-cal__step-title">Live parser output for {profile?.name ?? 'matched controller'}</Box>
      <Box className="hid-cal__live-parser-row">
        {state.buttons.map((pressed, i) => {
          // Every positional slot the device reports gets shown, not only the
          // ones with a default SNES mapping. An unmapped slot (Home, Capture,
          // C, GL, and anything past MISC1) still gets a neutral positional name
          // instead of silently disappearing from this view.
          const info = profile?.buttonsByIndex[i];
          const label = info?.label ?? sdlButtonNameForIndex(i) ?? `Button ${i}`;
          const chipCls = [
            'hid-cal__live-parser-chip',
            pressed && 'hid-cal__live-parser-chip--on',
            !info && 'hid-cal__live-parser-chip--unmapped',
          ].filter(Boolean).join(' ');
          return (
            <Text key={i} className={chipCls}>
              {label}
            </Text>
          );
        })}
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
