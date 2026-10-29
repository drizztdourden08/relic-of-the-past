/* @layer website-site @kind logic */
import type { Dispatch, SetStateAction, SyntheticEvent } from 'react';
import type { PlayerView } from '../SoundPlayer.type';

const videoHandlers = (setView: Dispatch<SetStateAction<PlayerView>>) => ({
  onPlay: () => setView((prev) => ({ ...prev, playing: true, started: true })),
  onPause: () => setView((prev) => ({ ...prev, playing: false })),
  onEnded: () => setView((prev) => ({ ...prev, playing: false })),
  onTimeUpdate: ({ currentTarget: { currentTime: time } }: SyntheticEvent<HTMLVideoElement>) => setView((prev) => ({ ...prev, time })),
  onDurationChange: ({ currentTarget: { duration } }: SyntheticEvent<HTMLVideoElement>) => setView((prev) => ({ ...prev, duration })),
  onVolumeChange: ({ currentTarget: { muted } }: SyntheticEvent<HTMLVideoElement>) => setView((prev) => ({ ...prev, muted })),
});

export { videoHandlers };
