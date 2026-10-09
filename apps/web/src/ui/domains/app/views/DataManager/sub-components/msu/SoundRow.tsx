/* @layer renderer-components @kind component */
import { Badge } from '@ds/primitives/Badge';
import { Box } from '@ds/primitives/Box';
import { Button } from '@ds/primitives/Button';
import { IconButton } from '@ds/primitives/IconButton';
import { Text } from '@ds/primitives/Text';
import { soundChannelPort, soundChannelTag, triggerSummary } from './sound-labels';
import { AMBIENT_ROLE_HINTS, AMBIENT_ROLE_LABELS } from './msu.constants';
import type { SoundRowProps } from './msu.type';

const SoundRow = (props: SoundRowProps) => {
  const {
    row, channel, showChannel = false, playing, additive, busy, expanded, playingOriginal, chipAudible, readOnly,
    onPreview, onStopPreview, onPlayOriginal, onToggleLayers, onStopReplacing,
  } = props;
  const { soundId, hex, label, triggers, sites, layerCount, unlisted, role, unreachable } = row;
  const replaced = layerCount > 0;
  const summary = triggerSummary(triggers);
  const name = label ?? (summary.length > 0 ? summary : 'Unnamed sound');
  const under = label !== null ? summary : `${sites} call site${sites === 1 ? '' : 's'}`;
  const stoppable = playing && !additive;
  const playsOriginal = !replaced;

  return (
    <Box className={`track-list__item msu-sound-row${expanded ? ' msu-sound-row--open' : ''}`}>
      {showChannel && (
        <Text className="msu-sound-row__channel" title={soundChannelPort(channel)}>
          {soundChannelTag(channel)}
        </Text>
      )}
      <Text className="track-list__num">{hex}</Text>

      <Box className="msu-sound-row__ident">
        <Text className="msu-sound-row__name" title={triggers.join(', ') || undefined}>{name}</Text>
        {under.length > 0 && !unlisted && (
          <Text className="msu-sound-row__triggers">{under}</Text>
        )}
      </Box>

      {role !== null && (
        <Badge variant="neutral" title={AMBIENT_ROLE_HINTS[role]}>{AMBIENT_ROLE_LABELS[role]}</Badge>
      )}
      {unreachable && (
        <Badge variant="warning" title="Nothing in the game writes this id, so a sound put here never plays">
          Never raised
        </Badge>
      )}

      <Badge variant={replaced ? 'success' : 'neutral'}>{replaced ? 'Replaced' : 'Native'}</Badge>
      {layerCount > 1 && <Badge variant="neutral">{layerCount} layers</Badge>}
      {chipAudible === false && !replaced && <Badge variant="neutral">Silent</Badge>}

      <Box className="msu-track-row__actions">
        {replaced && (
          <IconButton
            variant="ghost"
            size="sm"
            label={stoppable ? `Stop ${hex}` : `Play this pack's ${hex}`}
            active={playing}
            onClick={() => (stoppable ? onStopPreview() : onPreview(channel, soundId))}
          >
            {stoppable ? '■' : '▶'}
          </IconButton>
        )}
        <IconButton
          variant="ghost"
          size="sm"
          label={playingOriginal
            ? `Stop ${hex}`
            : `Play the sound chip's own ${hex}${replaced ? ', to compare' : ''}`}
          active={playingOriginal}
          onClick={() => onPlayOriginal(soundId)}
        >
          {playingOriginal ? '■' : '▷'}
        </IconButton>
        {replaced && (
          <IconButton
            variant="ghost"
            size="sm"
            label={`Layers for ${hex}`}
            active={expanded}
            disabled={busy}
            onClick={() => onToggleLayers(soundId)}
          >
            ☰
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
    </Box>
  );
};

export { SoundRow };
