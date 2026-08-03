/* @layer renderer-components @kind util */
/**
 * Subscribes to everything that can move an anchor out from under the panel
 * floating beside it, and hands back the matching unsubscribe.
 *
 * The scroll listener is registered in the CAPTURE phase deliberately. Scroll
 * events do not bubble, so a window-level listener in the bubble phase only
 * ever hears the document scrolling — capture is what lets one listener catch
 * a scroll fired on any container in between as well.
 *
 * Kept out of the hook, and taking its event target as an argument, so the
 * wiring can be checked without a DOM.
 */

type EventTargetLike = Pick<Window, 'addEventListener' | 'removeEventListener'>;

interface AnchorMovementHandlers {
  /** Something in the tree scrolled — the anchor may have moved or gone. */
  onScroll: () => void;
  /** The viewport resized — the anchor is still there, but elsewhere. */
  onResize: () => void;
}

const observeAnchorMovement = (
  target: EventTargetLike,
  handlers: AnchorMovementHandlers,
): (() => void) => {
  const { onScroll, onResize } = handlers;

  target.addEventListener('scroll', onScroll, true);
  target.addEventListener('resize', onResize);

  return () => {
    target.removeEventListener('scroll', onScroll, true);
    target.removeEventListener('resize', onResize);
  };
};

export { observeAnchorMovement };
export type { AnchorMovementHandlers, EventTargetLike };
