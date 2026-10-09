/* @layer renderer-components @kind component */
import { TrackList } from '../../../../music/compounds/TrackList';
import { readMusicPack } from '../../behavior/read-music-pack';
import { usePackRead } from '../../behavior/usePackRead';
import { usePackAudition } from '../../behavior/usePackAudition';
import { ContentsStatus } from '../ContentsStatus';
import type { PackSourceProps } from '../../PackContents.type';

const MusicContents = (props: PackSourceProps) => {
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
