/* @layer renderer-components @kind component */
/**
 * One of the game's sounds, and whether this pack answers it.
 *
 * The identity column reads name-then-evidence: the plain-language name on top, the game's own
 * function names beneath it. The name orients you and the functions prove it — which matters
 * because a name for a sound nobody has pinned down is a best guess, while the call sites are not.
 * An id with neither falls back to its function names as the name. The full trigger list stays on
 * the tooltip rather than wrapping the row into a paragraph.
 */
import { Badge } from '@ds/primitives/Badge';
import { Box } from '@ds/primitives/Box';
import { Button } from '@ds/primitives/Button';
import { IconButton } from '@ds/primitives/IconButton';
import { Text } from '@ds/primitives/Text';
import { triggerSummary } from './sound-labels';
import type { SoundRowProps } from './msu.type';

const SoundRow = (props: SoundRowProps) => {
  const {
    row, channel, playing, additive, busy, expanded, playingOriginal, chipAudible,
    onPreview, onStopPreview, onPlayOriginal, onToggleLayers, onStopReplacing,
  } = props;
  const { soundId, hex, label, triggers, sites, layerCount, unlisted } = row;
  const replaced = layerCount > 0;
  const summary = triggerSummary(triggers);
  // A named sound keeps its triggers as evidence underneath; an unnamed one is named by them.
  const name = label ?? (summary.length > 0 ? summary : 'Unnamed sound');
  const under = label !== null ? summary : `${sites} call site${sites === 1 ? '' : 's'}`;
  // Play never becomes stop on an effects channel: pressing it again is meant to add a sound.
  const stoppable = playing && !additive;
  // With nothing to replace it, play means the chip's own version — that IS the sound here.
  const playsOriginal = !replaced;

  return (
    <Box className={`track-list__item msu-sound-row${expanded ? ' msu-sound-row--open' : ''}`}>
      <Text className="track-list__num">{hex}</Text>

      <Box className="msu-sound-row__ident">
        <Text className="msu-sound-row__name" title={triggers.join(', ') || undefined}>{name}</Text>
        {under.length > 0 && !unlisted && (
          <Text className="msu-sound-row__triggers">{under}</Text>
        )}
      </Box>

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
