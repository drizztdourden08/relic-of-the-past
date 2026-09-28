/* @layer renderer-components @kind component */
/** A music pack's track list, with each file read from the pack and played on demand. */
import { TrackList } from '../../../../music/compounds/TrackList';
import { readMusicPack } from '../../behavior/read-music-pack';
import { usePackRead } from '../../behavior/usePackRead';
import { usePackAudition } from '../../behavior/usePackAudition';
import { ContentsStatus } from '../ContentsStatus';
import type { PackSource } from '../../../../pack-source.type';

type MusicContentsProps = {
  source: PackSource;
};

const MusicContents = (props: MusicContentsProps) => {
  const { source } = props;
  const { data, error } = usePackRead(source, readMusicPack);
  const audition = usePackAudition(source, data);

  if (!data) return <ContentsStatus error={error} />;
  return (
    <TrackList
      manifest={data.manifest}
      playing={audition.playing}
      loading={audition.loading}
      audition={audition.audition}
      notes={audition.notes}
      onPlay={audition.toggle}
    />
  );
};

export { MusicContents };
export type { MusicContentsProps };
