/* @layer renderer-components @kind component */
import { useEffect, useRef, useState } from 'react';
import type { KeyboardEvent } from 'react';
import { Status, Box, Icon, IconButton, Text, TextInput } from '@drizztdourden08/tessera/primitives';
import type { MsuFileMetadata } from '@rotp/msu';
import { formatBytes } from '@drizztdourden08/brock-core';
import { FilePlayer, clock } from '@rotp/design/packs';
import { listSummary } from './sound-labels';
import { UNKNOWN } from './FileRow.constants';
import type { FileRowProps } from './FileRow.type';

const channelName = (channels: number): string => {
  if (channels === 1) return 'mono';
  if (channels === 2) return 'stereo';
  return `${channels} ch`;
};

const loopTextOf = (seconds: number | null | undefined): string => {
  if (seconds === undefined) return UNKNOWN;
  if (seconds === null) return 'none';
  return clock(seconds);
};

const rateSpec = (file: MsuFileMetadata): string => {
  const { sampleRate, channels } = file;
  if (sampleRate === null || channels === null) return UNKNOWN;
  return `${(sampleRate / 1000).toFixed(1)} kHz · ${channelName(channels)}`;
};

const FileRow = (props: FileRowProps) => {
  const { file, usedBy, loopSeconds, playing, loading, audition, busy, readOnly, onPlay, onRename, onDelete } = props;
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(file.name);
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
    else if (event.key === 'Escape') { event.preventDefault(); cancelled.current = true; event.currentTarget.blur(); }
  };

  const loopText = loopTextOf(loopSeconds);

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
            title={readOnly ? file.name : `${file.name} (click to rename)`}
            onClick={readOnly ? undefined : () => setEditing(true)}
          >
            {file.name}
          </Text>
        )}

        <Box className="msu-file-row__cell"><Status tone="neutral">{file.ext}</Status></Box>
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
            <Status tone="warning">unused</Status>
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
            <Icon name={playing ? 'square' : 'play'} />
          </IconButton>
          <IconButton
            variant="ghost" size="sm" label={`Delete ${file.name}`} disabled={busy || readOnly}
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
