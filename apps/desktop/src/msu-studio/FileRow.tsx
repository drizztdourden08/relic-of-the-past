/* @layer renderer-components @kind component */
import { Status, Box, Text } from '@drizztdourden08/tessera/primitives';
import type { I18n } from '@drizztdourden08/brock-core/i18n';
import type { MsuFileMetadata } from '@rotp/msu';
import { formatBytes } from '@drizztdourden08/brock-core';
import { useT } from '@drizztdourden08/brock-react';
import { FilePlayer, clock } from '@rotp/design/packs';
import { useFileRename } from './behavior/useFileRename';
import { FileActions } from './FileActions';
import { FileNameCell } from './FileNameCell';
import { listSummary } from './sound-labels';
import { UNKNOWN } from './FileRow.constants';
import type { FileRowProps } from './FileRow.type';

const channelName = (t: I18n['t'], channels: number): string => {
  if (channels === 1) return t('msu-studio:files.channels.mono');
  if (channels === 2) return t('msu-studio:files.channels.stereo');
  return t('msu-studio:files.channels.count', { count: channels });
};

const loopTextOf = (t: I18n['t'], seconds: number | null | undefined): string => {
  if (seconds === undefined) return UNKNOWN;
  if (seconds === null) return t('msu-studio:files.loop.none');
  return clock(seconds);
};

const rateSpec = (t: I18n['t'], file: MsuFileMetadata): string => {
  const { sampleRate, channels } = file;
  if (sampleRate === null || channels === null) return UNKNOWN;
  return t('msu-studio:files.rate.spec', { rate: (sampleRate / 1000).toFixed(1), channels: channelName(t, channels) });
};

const FileRow = (props: FileRowProps) => {
  const { file, usedBy, loopSeconds, playing, loading, audition, busy, readOnly, onPlay, onRename, onDelete } = props;
  const t = useT();
  const rename = useFileRename({ name: file.name, onRename });

  return (
    <Box className={`msu-file-entry${playing ? ' msu-file-entry--playing' : ''}`}>
      <Box className="msu-file-row">
        <FileNameCell name={file.name} busy={busy} readOnly={readOnly} rename={rename} />

        <Box className="msu-file-row__cell"><Status tone="neutral">{file.ext}</Status></Box>
        <Text className="msu-file-row__spec">{formatBytes(file.size)}</Text>
        <Text
          className="msu-file-row__spec"
          title={file.durationSeconds === null ? t('msu-studio:files.length.needs-decoder') : t('msu-studio:files.length.title')}
        >
          {file.durationSeconds === null ? UNKNOWN : clock(file.durationSeconds)}
        </Text>
        <Text className="msu-file-row__spec" title={t('msu-studio:files.rate.title')}>{rateSpec(t, file)}</Text>
        <Text
          className="msu-file-row__spec"
          title={loopSeconds === undefined ? t('msu-studio:files.loop.unknown-title') : t('msu-studio:files.loop.title')}
        >
          {loopTextOf(t, loopSeconds)}
        </Text>

        <Box className="msu-file-row__cell">
          {usedBy.length === 0 ? (
            <Status tone="warning">{t('msu-studio:files.unused')}</Status>
          ) : (
            <Text className="msu-file-row__used" title={usedBy.join(', ')}>{listSummary(t, usedBy)}</Text>
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
