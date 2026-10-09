/* @layer renderer-components @kind component */
import { useEffect } from 'react';
import { Box } from '@ds/primitives/Box';
import { IconButton } from '@ds/primitives/IconButton';
import { Slider } from '@ds/primitives/Slider';
import { Text } from '@ds/primitives/Text';
import { useDismissable } from '@ds/primitives/Portal';
import { useMotionPreview } from '../behavior/motion-preview';
import type { MotionTransportProps } from './MotionTransport.type';

const MotionTransport = (props: MotionTransportProps) => {
  const { spanMs } = props;
  const preview = useMotionPreview();
  const setSpan = preview?.setSpan;

  useEffect(() => { setSpan?.(spanMs); }, [setSpan, spanMs]);

  useDismissable({ active: preview?.playing === true, level: 'dialog', onDismiss: () => preview?.pause() });

  if (!preview) return null;

  if (preview.disabled) {
    return (
      <Text className="hud-editor__hint">
        Reduced motion is on, so animations are held at their rest pose here and in game, so there is
        nothing to play. Transitions and enter/exit still run.
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
        {preview.playing ? '❚❚' : '▶'}
      </IconButton>
      <Slider
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
export type { MotionTransportProps } from './MotionTransport.type';
