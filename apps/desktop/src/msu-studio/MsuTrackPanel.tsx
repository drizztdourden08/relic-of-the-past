/* @layer renderer-components @kind component */
import { DELUXE_TRACK_THRESHOLD } from '@rotp/hub-contracts';
import { Box, Text } from '@drizztdourden08/tessera/primitives';
import { useT } from '@drizztdourden08/brock-react';
import { TrackSection } from './TrackSection';
import { UnusedAudio } from './UnusedAudio';
import type { MsuTrackPanelProps } from './MsuTrackPanel.type';

const MsuTrackPanel = (props: MsuTrackPanelProps) => {
  const { rows, files, unusedFiles, busy, readOnly, selected, note, controls, onSelect, onDeleteFile } = props;
  const t = useT();
  const sectionProps = { files, selected, controls, onSelect };

  return (
    <Box className="msu-panel">
      {note !== null && <Text className="msu-status msu-status--error">{note}</Text>}

      <TrackSection
        title={t('msu-studio:track.section.standard')}
        rows={rows.filter((r) => r.trackNum < DELUXE_TRACK_THRESHOLD)}
        {...sectionProps}
      />
      <TrackSection
        title={t('msu-studio:track.section.extended')}
        rows={rows.filter((r) => r.trackNum >= DELUXE_TRACK_THRESHOLD)}
        {...sectionProps}
      />

      <UnusedAudio unusedFiles={unusedFiles} busy={busy} readOnly={readOnly} onDeleteFile={onDeleteFile} />
    </Box>
  );
};

export { MsuTrackPanel };
