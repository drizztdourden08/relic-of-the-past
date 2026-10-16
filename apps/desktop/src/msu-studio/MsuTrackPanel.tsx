/* @layer renderer-components @kind component */
import { DELUXE_TRACK_THRESHOLD } from '@rotp/hub-contracts';
import { Box, Text } from '@drizztdourden08/tessera/primitives';
import { TrackSection } from './TrackSection';
import { UnusedAudio } from './UnusedAudio';
import type { MsuTrackPanelProps } from './MsuTrackPanel.type';

const MsuTrackPanel = (props: MsuTrackPanelProps) => {
  const { rows, files, unusedFiles, busy, readOnly, selected, note, controls, onSelect, onDeleteFile } = props;
  const sectionProps = { files, selected, controls, onSelect };

  return (
    <Box className="msu-panel">
      {note !== null && <Text className="msu-status msu-status--error">{note}</Text>}

      <TrackSection
        title="Standard Slots"
        rows={rows.filter((r) => r.trackNum < DELUXE_TRACK_THRESHOLD)}
        {...sectionProps}
      />
      <TrackSection
        title="Extended Slots"
        rows={rows.filter((r) => r.trackNum >= DELUXE_TRACK_THRESHOLD)}
        {...sectionProps}
      />

      <UnusedAudio unusedFiles={unusedFiles} busy={busy} readOnly={readOnly} onDeleteFile={onDeleteFile} />
    </Box>
  );
};

export { MsuTrackPanel };
