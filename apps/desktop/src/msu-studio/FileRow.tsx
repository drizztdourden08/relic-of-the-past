/* @layer renderer-components @kind component */
import { Status, Box, Text } from '@drizztdourden08/tessera/primitives';
import type { MsuFileMetadata } from '@rotp/msu';
import { formatBytes } from '@drizztdourden08/brock-core';
import { FilePlayer, clock } from '@rotp/design/packs';
import { useFileRename } from './behavior/useFileRename';
import { FileActions } from './FileActions';
import { FileNameCell } from './FileNameCell';
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
  const rename = useFileRename({ name: file.name, onRename });

  return (
    <Box className={`msu-file-entry${playing ? ' msu-file-entry--playing' : ''}`}>
      <Box className="msu-file-row">
        <FileNameCell name={file.name} busy={busy} readOnly={readOnly} rename={rename} />

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
          {loopTextOf(loopSeconds)}
        </Text>

        <Box className="msu-file-row__cell">
          {usedBy.length === 0 ? (
            <Status tone="warning">unused</Status>
          ) : (
            <Text className="msu-file-row__used" title={usedBy.join(', ')}>{listSummary(usedBy)}</Text>
          )}
        </Box>

        <FileActions
          name={file.name}
          playing={playing}
          loading={loading}
          busy={busy}
          readOnly={readOnly}
          onPlay={onPlay}
          onDelete={onDelete}
        />
      </Box>

      {playing && audition !== null && <FilePlayer audition={audition} />}
    </Box>
  );
};

export { FileRow };
