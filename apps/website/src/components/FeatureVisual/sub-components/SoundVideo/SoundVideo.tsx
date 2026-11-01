/* @layer website-site @kind component */
import { useRef, useState } from 'react';
import type { ReactNode } from 'react';
import { aspectOf } from '../../behavior/aspect-of';
import { Expandable } from '../Expandable';
import { ShotFrame } from '../ShotFrame';
import { SoundPlayer, START_SYNC } from '../SoundPlayer';
import type { PlaybackSync } from '../SoundPlayer';
import type { SoundVideoProps } from './SoundVideo.type';

const SoundVideo = ({ clip, steps, caption }: SoundVideoProps) => {
  const [open, setOpen] = useState(false);
  const sync = useRef<PlaybackSync>({ ...START_SYNC });

  const expandable = (video: ReactNode) => (
    <Expandable
      aspect={aspectOf(clip.poster)}
      label={caption}
      onOpenChange={setOpen}
      expanded={<SoundPlayer clip={clip} sync={sync} steps={steps} active />}
    >
      {video}
    </Expandable>
  );

  return (
    <ShotFrame caption={caption}>
      <SoundPlayer clip={clip} sync={sync} steps={steps} active={!open} frame={expandable} listed />
    </ShotFrame>
  );
};

export { SoundVideo };
