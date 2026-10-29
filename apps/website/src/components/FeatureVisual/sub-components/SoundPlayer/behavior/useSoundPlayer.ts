/* @layer website-site @kind hook */
import { useEffect, useRef, useState } from 'react';
import type { KeyboardEvent, MouseEvent, RefObject } from 'react';
import { SEEK_DIRECTIONS, SEEK_STEP_SECONDS } from '../SoundPlayer.constants';
import type { PlaybackSync, PlayerView } from '../SoundPlayer.type';
import { videoHandlers } from './video-handlers';

const useSoundPlayer = (sync: RefObject<PlaybackSync>, active: boolean) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [view, setView] = useState<PlayerView>(() => ({
    playing: false,
    started: sync.current.time > 0,
    time: sync.current.time,
    duration: 0,
    muted: sync.current.muted,
  }));

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !active) return undefined;
    const { time, playing, muted } = sync.current;
    video.muted = muted;
    setView((prev) => ({ ...prev, muted }));
    if (time > 0) video.currentTime = time;
    if (playing) video.play().catch(() => undefined);
    return () => {
      sync.current = { time: video.currentTime, playing: !video.paused && !video.ended, muted: video.muted };
      video.pause();
    };
  }, [active, sync]);

  const toggle = (): void => {
    const video = videoRef.current;
    if (!video) return;
    if (video.paused) video.play().catch(() => undefined);
    else video.pause();
  };

  const toggleMute = (): void => {
    if (videoRef.current) videoRef.current.muted = !videoRef.current.muted;
  };

  const seekTo = (seconds: number): void => {
    const video = videoRef.current;
    if (!video || !(video.duration > 0)) return;
    video.currentTime = Math.min(Math.max(seconds, 0), video.duration);
    setView((prev) => ({ ...prev, time: video.currentTime }));
  };

  const playAt = (seconds: number): void => {
    seekTo(seconds);
    videoRef.current?.play().catch(() => undefined);
  };

  const seekByPointer = (event: MouseEvent<HTMLElement>): void => {
    event.stopPropagation();
    const rect = event.currentTarget.getBoundingClientRect();
    const video = videoRef.current;
    if (video) seekTo(((event.clientX - rect.left) / rect.width) * video.duration);
  };

  const seekByKey = (event: KeyboardEvent<HTMLElement>): void => {
    const direction = SEEK_DIRECTIONS[event.key];
    const video = videoRef.current;
    if (!video || !direction) return;
    event.preventDefault();
    seekTo(video.currentTime + direction * SEEK_STEP_SECONDS);
  };

  return { videoRef, view, toggle, toggleMute, playAt, seekByPointer, seekByKey, videoHandlers: videoHandlers(setView) };
};

export { useSoundPlayer };
