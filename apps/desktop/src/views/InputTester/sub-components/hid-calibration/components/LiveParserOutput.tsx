/* @layer renderer-components @kind component */
import { Box, Text } from '@drizztdourden08/tessera/primitives';
import { sdlButtonNameForIndex } from '../diagnostics/sdl-button-name-for-index';
import type { LiveParserOutputProps } from './LiveParserOutput.type';

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
