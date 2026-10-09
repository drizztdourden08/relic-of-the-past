/* @layer renderer-app @kind component */
import { useEffect, useState } from 'react';
import { Box } from '@ds/primitives';
import { useBootProgressStore } from '@app/stores/boot-progress-store';
import { FADE_MS, MIN_VISIBLE_MS } from './BootProgressBar.constants';
import './BootProgressBar.css';

const BootProgressBar = () => {
  const phase = useBootProgressStore((s) => s.phase);
  const message = useBootProgressStore((s) => s.message);
  const ratio = useBootProgressStore((s) => s.ratio);
  const [shownAt] = useState(() => performance.now());
  const [fading, setFading] = useState(false);
  const [gone, setGone] = useState(false);

  useEffect(() => {
    if (phase !== 'ready') return;
    const remaining = Math.max(0, MIN_VISIBLE_MS - (performance.now() - shownAt));
    const timer = setTimeout(() => setFading(true), remaining);
    return () => clearTimeout(timer);
  }, [phase, shownAt]);

  useEffect(() => {
    if (!fading) return;
    const timer = setTimeout(() => setGone(true), FADE_MS);
    return () => clearTimeout(timer);
  }, [fading]);

  if (gone || phase === 'idle') return null;

  const atReady = phase === 'ready';
  const indeterminate = ratio == null && !atReady;
  const fillWidth = atReady ? '100%' : indeterminate ? undefined : `${Math.round((ratio ?? 0) * 100)}%`;

  return (
    <Box
      className={`boot-bar${fading ? ' boot-bar--done' : ''}${indeterminate ? ' boot-bar--indeterminate' : ''}`}
      role="progressbar"
      aria-label={message || 'Loading game core'}
      aria-hidden={fading}
    >
      <Box className="boot-bar__label">{message}</Box>
      <Box className="boot-bar__fill" style={fillWidth ? { width: fillWidth } : undefined}>
        <Box className="boot-bar__label boot-bar__label--over">{message}</Box>
      </Box>
    </Box>
  );
};

export { BootProgressBar };
