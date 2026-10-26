/* @layer renderer-components @kind component */
import { useEffect } from 'react';
import { Box, Icon, IconButton, Slider, Text, useEscapeStack } from '@drizztdourden08/tessera/primitives';
import { useMotionPreview } from '@app/hud-layout-editing/motion-preview';
import type { MotionTransportProps } from './MotionTransport.type';

const MotionTransport = (props: MotionTransportProps) => {
  const { spanMs } = props;
  const preview = useMotionPreview();
  const setSpan = preview?.setSpan;

  useEffect(() => { setSpan?.(spanMs); }, [setSpan, spanMs]);

  useEscapeStack({ active: preview?.playing === true, level: 'dialog', onEscape: () => preview?.pause() });

  if (!preview) return null;

  if (preview.disabled) {
    return (
      <Text className="hud-editor__hint">
        Reduced motion is on, so animations are held at their rest pose.
      </Text>
    );
  }

  return (
    <Box className="hud-transport">
      <IconButton
        variant="ghost"
        size="sm"
        active={preview.playing}
        label={preview.playing ? 'Pause the stage' : 'Play on the stage'}
        onClick={() => (preview.playing ? preview.pause() : preview.play())}
      >
<Icon name={preview.playing ? 'pause' : 'play'} size={14} />
      </IconButton>
      <Slider
        className="hud-transport__slider"
        value={preview.nowMs ?? 0}
        min={0}
        max={Math.max(1, spanMs)}
        step={1}
        formatValue={(n) => `${Math.round(n)}ms`}
        onChange={preview.scrubTo}
      />
    </Box>
  );
};

export { MotionTransport };
