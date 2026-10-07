/* @layer renderer-components @kind component */
/**
 * A music pack's contents, read only: a summary line, then one row per slot the pack fills,
 * tracks first and replaced sounds after, each with its files and a play button per file. The
 * playing file opens the shared file player under it. What plays, and how the bytes arrive,
 * is the caller's business.
 */
import { useMemo } from 'react';
import { Box, EmptyState, Text } from '@ds/primitives';
import { SlotSection } from './sub-components/SlotSection';
import { packSummary, soundRows, summaryText, trackRows } from './behavior/track-list-model';
import type { TrackListProps } from './TrackList.type';
import './TrackList.css';

const TrackList = (props: TrackListProps) => {
  const { manifest, playing, loading, audition, notes, onPlay, className } = props;
  const tracks = useMemo(() => trackRows(manifest), [manifest]);
  const sounds = useMemo(() => soundRows(manifest), [manifest]);
  const summary = useMemo(() => summaryText(packSummary(manifest)), [manifest]);
  const shared = { playing, loading, audition, notes, onPlay };

  return (
    <Box className={`pack-tracks${className ? ` ${className}` : ''}`}>
      <Text className="pack-tracks__summary">{summary}</Text>
      {tracks.length === 0 && sounds.length === 0 ? <EmptyState message="This pack fills no slot" /> : null}
      <SlotSection title="Music" rows={tracks} {...shared} />
      <SlotSection title="Sounds" rows={sounds} {...shared} />
    </Box>
  );
};

export { TrackList };
