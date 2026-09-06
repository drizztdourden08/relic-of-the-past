/* @layer renderer-components @kind component */
/**
 * Identity reads name-then-evidence: the catalogue name on top (a best guess) and the game's own
 * function names beneath (not a guess). An id with no name is named by its functions. The full
 * trigger list stays on the tooltip. `showChannel` is set wherever one list carries more than one
 * channel, because the channels do NOT share an id space.
 */
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
    row, channel, showChannel = false, playing, additive, busy, expanded, playingOriginal, chipAudible,
    onPreview, onStopPreview, onPlayOriginal, onToggleLayers, onStopReplacing,
  } = props;
  const { soundId, hex, label, triggers, sites, layerCount, unlisted, role, unreachable } = row;
  const replaced = layerCount > 0;
  const summary = triggerSummary(triggers);
  // A named sound keeps its triggers as evidence underneath; an unnamed one is named by them.
  const name = label ?? (summary.length > 0 ? summary : 'Unnamed sound');
  const under = label !== null ? summary : `${sites} call site${sites === 1 ? '' : 's'}`;
  // Play never becomes stop on an effects channel: pressing it again is meant to add a sound.
  const stoppable = playing && !additive;
  // With nothing to replace it, play means the chip's own version, which IS the sound here.
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

      {/* What the id does on its channel, which is what decides whether a replacement can work. */}
      {role !== null && (
        <Badge variant="neutral" title={AMBIENT_ROLE_HINTS[role]}>{AMBIENT_ROLE_LABELS[role]}</Badge>
      )}
      {/* Shown only because the unreachable ids were asked for, so say why it was hidden. */}
      {unreachable && (
        <Badge variant="warning" title="Nothing in the game writes this id, so a sound put here never plays">
          Never raised
        </Badge>
      )}

      <Badge variant={replaced ? 'success' : 'neutral'}>{replaced ? 'Replaced' : 'Native'}</Badge>
      {layerCount > 1 && <Badge variant="neutral">{layerCount} layers</Badge>}
      {/* Only worth saying on an id with nothing to it: the pack could still put a sound there. */}
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
          <Button variant="tertiary" size="sm" disabled={busy} onClick={() => onStopReplacing(soundId)}>
            Stop replacing
          </Button>
        ) : (
          <Button variant="secondary" size="sm" disabled={busy} onClick={() => onToggleLayers(soundId)}>
            {expanded ? 'Cancel' : 'Replace'}
          </Button>
        )}
      </Box>
    </Box>
  );
};

export { SoundRow };
