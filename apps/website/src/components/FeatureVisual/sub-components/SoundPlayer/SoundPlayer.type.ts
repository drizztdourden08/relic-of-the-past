/* @layer website-site @kind types */
import type { ReactNode, RefObject } from 'react';
import type { VideoClip } from '../../../../features';

type PlaybackSync = { time: number; playing: boolean; muted: boolean };

type PlayerView = { playing: boolean; started: boolean; time: number; duration: number; muted: boolean };

type SoundPlayerProps = {
  clip: VideoClip;
  sync: RefObject<PlaybackSync>;
  active: boolean;
  frame?: (video: ReactNode) => ReactNode;
};

export type { PlaybackSync, PlayerView, SoundPlayerProps };
