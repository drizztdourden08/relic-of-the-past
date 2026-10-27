/* @layer website-site @kind hook */
import { useRef, useState } from 'react';
import type { KeyboardEvent, MouseEvent } from 'react';
import { PROGRESS_VAR, SEEK_DIRECTIONS, SEEK_STEP_SECONDS } from '../AudioBar.constants';

const useAudioPlayer = () => {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const barRef = useRef<HTMLElement | null>(null);
  const [playing, setPlaying] = useState(false);

  const paint = (): void => {
    const audio = audioRef.current;
    const share = audio && audio.duration > 0 ? audio.currentTime / audio.duration : 0;
    barRef.current?.style.setProperty(PROGRESS_VAR, String(share));
    barRef.current?.setAttribute('aria-valuenow', String(Math.round(share * 100)));
  };

  const toggle = (): void => {
    const audio = audioRef.current;
    if (!audio) return;
    if (audio.paused) audio.play().catch(() => setPlaying(false));
    else audio.pause();
  };

  const seekTo = (seconds: number): void => {
    const audio = audioRef.current;
    if (!audio || !(audio.duration > 0)) return;
    audio.currentTime = Math.min(Math.max(seconds, 0), audio.duration);
    paint();
  };

  const seekByPointer = (event: MouseEvent<HTMLElement>): void => {
    const rect = event.currentTarget.getBoundingClientRect();
    const audio = audioRef.current;
    if (audio) seekTo(((event.clientX - rect.left) / rect.width) * audio.duration);
  };

  const seekByKey = (event: KeyboardEvent<HTMLElement>): void => {
    const audio = audioRef.current;
    const direction = SEEK_DIRECTIONS[event.key];
    if (!audio || !direction) return;
    event.preventDefault();
    seekTo(audio.currentTime + direction * SEEK_STEP_SECONDS);
  };

  const audioHandlers = {
    onPlay: () => setPlaying(true),
    onPause: () => setPlaying(false),
    onEnded: () => {
      setPlaying(false);
      paint();
    },
    onTimeUpdate: paint,
    onLoadedMetadata: paint,
  };

  return { audioRef, barRef, playing, toggle, seekByPointer, seekByKey, audioHandlers };
};

export { useAudioPlayer };
