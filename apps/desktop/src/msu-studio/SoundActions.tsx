/* @layer renderer-components @kind component */
import { Box, Button, Icon, IconButton } from '@drizztdourden08/tessera/primitives';
import { SoundPlayButtons } from './SoundPlayButtons';
import type { SoundActionsProps } from './SoundActions.type';

const SoundActions = (props: SoundActionsProps) => {
  const { row, busy, expanded, readOnly, onToggleLayers, onStopReplacing } = props;
  const { soundId, hex, layerCount } = row;
  const replaced = layerCount > 0;

  return (
    <Box className="msu-track-row__actions">
      <SoundPlayButtons {...props} />
      {replaced && (
        <IconButton
          variant="ghost"
          size="sm"
          label={`Layers for ${hex}`}
          active={expanded}
          disabled={busy}
          onClick={() => onToggleLayers(soundId)}
        >
          <Icon name="layers" />
        </IconButton>
      )}
      {replaced ? (
        <Button variant="tertiary" size="sm" disabled={busy || readOnly} onClick={() => onStopReplacing(soundId)}>
          Stop replacing
        </Button>
      ) : (
        <Button variant="secondary" size="sm" disabled={busy || readOnly} onClick={() => onToggleLayers(soundId)}>
          {expanded ? 'Cancel' : 'Replace'}
        </Button>
      )}
    </Box>
  );
};

export { SoundActions };
