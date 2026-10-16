/* @layer renderer-components @kind component */
import { SectionNote } from './SectionNote';
import { SoundDetail } from './SoundDetail';
import type { SoundSideProps } from './SoundDetail.type';

const SoundSide = (props: SoundSideProps) => {
  const { open, noteTitle, note, packPanel, ...detail } = props;

  if (open === null) return <><SectionNote title={noteTitle}>{note}</SectionNote>{packPanel}</>;
  return <SoundDetail {...detail} channel={open.channel} row={open.row} sound={open.sound} />;
};

export { SoundSide };
