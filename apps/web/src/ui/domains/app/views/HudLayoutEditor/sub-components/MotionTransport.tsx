/* @layer renderer-components @kind component */
/**
 * Play and scrub, against the real stage. "Nothing plays the animation. The
 * stage renders it, but there is no scrub, no play, and no way to see 300 ms
 * of ease-out except by saving and watching the game"
 * (`plans/hud-inspector-ux-review.html`, finding 8).
 *
 * IT DRIVES THE STAGE, NOT A SECOND PREVIEW. The scrub sets the ONE clock
 * `HudNodeRenderer` already samples every animation against (§27.7), so what
 * moves is the actual HUD, drawn by the game's own renderer over the game's
 * own ground. It is the last heart pulsing, not a diagram of a curve. A separate
 * mini-preview would be a second implementation of motion to keep in step with
 * the first, which is the mistake `EditorStage`'s own header refuses.
 *
 * PLAY IS A LOOP OVER ONE SPAN, not a clock climbing forever. The span is the
 * longest `delay + duration` on this node, so a stagger inside a `repeat` is
 * watched from the first instance's start to the last one's finish and then
 * repeats, so the scrub's right-hand end means something.
 *
 * UNDER REDUCED MOTION IT IS DISABLED AND SAYS SO. §27.6 silences every
 * `animation` outright under `prefers-reduced-motion: reduce`; a transport
 * that visibly did nothing would read as a broken button, and silently
 * overriding the preference to "just preview it" would defeat the setting the
 * author's own OS asked for.
 */
import { useEffect } from 'react';
import { Box } from '@ds/primitives/Box';
import { IconButton } from '@ds/primitives/IconButton';
import { Slider } from '@ds/primitives/Slider';
import { Text } from '@ds/primitives/Text';
import { useDismissable } from '@ds/primitives/Portal';
import { useMotionPreview } from '../behavior/motion-preview';

interface MotionTransportProps {
  /** The longest `delay + duration` on this node, in ms. That is one full pass. */
  spanMs: number;
}

const MotionTransport = (props: MotionTransportProps) => {
  const { spanMs } = props;
  const preview = useMotionPreview();
  const setSpan = preview?.setSpan;

  useEffect(() => { setSpan?.(spanMs); }, [setSpan, spanMs]);

  // A RUNNING PREVIEW IS A SURFACE, in §33's sense: it is the innermost thing
  // the author has going, so `Escape` should stop it and leave the editor
  // standing. Pressing it again then closes the editor as usual. Registered
  // at `dialog`, which beats the `layer` the editor is and loses to any menu
  // or popover opened over it, and ONLY while playing: a paused transport owns
  // no key. This is exactly why §33 replaced eight private `document`
  // listeners with one stack. A ninth one here could not have been ordered
  // against the app shell's own shortcut.
  useDismissable({ active: preview?.playing === true, level: 'dialog', onDismiss: () => preview?.pause() });

  // Outside the editor's own provider (a measurement harness, a test fixture)
  // there is no stage to drive, so there is no transport to draw.
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
export type { MotionTransportProps };
