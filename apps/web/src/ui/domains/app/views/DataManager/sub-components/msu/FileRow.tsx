/* @layer renderer-components @kind component */
/**
 * One file in the pack: what it is, what plays it, and its name. The name is editable here because
 * in a pack without a manifest the name IS the wiring, and everywhere else it is the only handle
 * the layer editor gives you for picking a file.
 *
 * A rename commits when the field is left, never per keystroke: every commit copies the bytes to
 * the new name and re-points the manifest, which is not something to do once per letter.
 *
 * The card is the entry and the grid row is only its top line, so the player opens INSIDE the file
 * it belongs to instead of under it. Every cell sits in the column template the list declares, so
 * a row cannot lay itself out and drift out of line with the header.
 *
 * Length, rate and channels are known for MSU-1 pcm alone. That format fixes the rate and the
 * channel count, so all three follow from the byte count; an encoded file would have to be decoded
 * to answer, so it reads as unknown, not as zero. A repeat point needs the file itself, so
 * it appears once the file has been played and not before.
 */
import { useEffect, useRef, useState } from 'react';
import type { KeyboardEvent } from 'react';
import { Badge } from '@ds/primitives/Badge';
import { Box } from '@ds/primitives/Box';
import { IconButton } from '@ds/primitives/IconButton';
import { Text } from '@ds/primitives/Text';
import { TextInput } from '@ds/primitives/TextInput';
import type { MsuFileMetadata } from '@shared/storage/msu';
import { formatBytes } from '@app/utils/formatBytes';
import { FilePlayer } from './FilePlayer';
import { clock } from './behavior/clock';
import { listSummary } from './sound-labels';
import type { Audition } from './behavior/file-audition';

interface FileRowProps {
  file: MsuFileMetadata;
  /** The places that name this file; empty means nothing plays it. */
  usedBy: string[];
  /** Seconds it repeats from, null when it declares none, undefined until it has been played. */
  loopSeconds: number | null | undefined;
  playing: boolean;
  /** True while its bytes are being fetched and decoded, before a note sounds. */
  loading: boolean;
  /** The handle on the sounding file, for the player this row opens. Null unless it is playing. */
  audition: Audition | null;
  busy: boolean;
  onPlay: (fileName: string) => void;
  onRename: (from: string, to: string) => void;
  onDelete: (fileName: string) => void;
}

const UNKNOWN = '-';

const channelName = (channels: number): string =>
  (channels === 1 ? 'mono' : channels === 2 ? 'stereo' : `${channels} ch`);

/** `44.1 kHz · stereo`, or unknown for a format that would have to be decoded to say. */
const rateSpec = (file: MsuFileMetadata): string => {
  const { sampleRate, channels } = file;
  if (sampleRate === null || channels === null) return UNKNOWN;
  return `${(sampleRate / 1000).toFixed(1)} kHz · ${channelName(channels)}`;
};

const FileRow = (props: FileRowProps) => {
  const { file, usedBy, loopSeconds, playing, loading, audition, busy, onPlay, onRename, onDelete } = props;
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(file.name);
  // Escape has to be known to the blur that follows it, and it lands in the same tick, so it
  // cannot go through state.
  const cancelled = useRef(false);

  useEffect(() => { setDraft(file.name); }, [file.name]);

  const handleBlur = (): void => {
    setEditing(false);
    if (cancelled.current) { cancelled.current = false; setDraft(file.name); return; }
    const wanted = draft.trim();
    if (wanted !== file.name) onRename(file.name, wanted);
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>): void => {
    if (event.key === 'Enter') event.currentTarget.blur();
    else if (event.key === 'Escape') { cancelled.current = true; event.currentTarget.blur(); }
  };

  const loopText = loopSeconds === undefined ? UNKNOWN : loopSeconds === null ? 'none' : clock(loopSeconds);

  return (
    <Box className={`msu-file-entry${playing ? ' msu-file-entry--playing' : ''}`}>
      <Box className="msu-file-row">
        {editing ? (
          <Box className="msu-file-row__edit">
            <TextInput
              type="text"
              value={draft}
              aria-label={`Name of ${file.name}`}
              autoFocus
              disabled={busy}
              onChange={(event) => setDraft(event.target.value)}
              onKeyDown={handleKeyDown}
              onBlur={handleBlur}
            />
          </Box>
        ) : (
          <Text
            className="msu-file-row__name"
            title={`${file.name} (click to rename)`}
            onClick={() => setEditing(true)}
          >
            {file.name}
          </Text>
        )}

        <Box className="msu-file-row__cell"><Badge variant="neutral">{file.ext}</Badge></Box>
        <Text className="msu-file-row__spec">{formatBytes(file.size)}</Text>
        <Text
          className="msu-file-row__spec"
          title={file.durationSeconds === null ? 'Length needs a decoder to know' : 'Length'}
        >
          {file.durationSeconds === null ? UNKNOWN : clock(file.durationSeconds)}
        </Text>
        <Text className="msu-file-row__spec" title="Sample rate and channels">{rateSpec(file)}</Text>
        <Text
          className="msu-file-row__spec"
          title={loopSeconds === undefined ? 'Play the file to read where it repeats from' : 'Repeats from'}
        >
          {loopText}
        </Text>

        <Box className="msu-file-row__cell">
          {usedBy.length === 0 ? (
            <Badge variant="warning">unused</Badge>
          ) : (
            <Text className="msu-file-row__used" title={usedBy.join(', ')}>{listSummary(usedBy)}</Text>
          )}
        </Box>

        <Box className="msu-file-row__actions">
          <IconButton
            variant="ghost"
            size="sm"
            label={playing ? `Stop ${file.name}` : `Play ${file.name}`}
            active={playing}
            disabled={loading}
            onClick={() => onPlay(file.name)}
          >
            {playing ? '■' : '▶'}
          </IconButton>
          <IconButton
            variant="ghost" size="sm" label={`Delete ${file.name}`} disabled={busy}
            onClick={() => onDelete(file.name)}
          >
            ✕
          </IconButton>
        </Box>
      </Box>

      {playing && audition !== null && <FilePlayer audition={audition} />}
    </Box>
  );
};

export { FileRow };
export type { FileRowProps };
