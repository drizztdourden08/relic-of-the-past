/* @layer website-site @kind constants */
const ZOOM_MIN = 1;
const ZOOM_MAX = 4;
const WHEEL_SENSITIVITY = 0.0015;
const WHEEL_LINE_PIXELS = 33;
const REST_ZOOM = { scale: ZOOM_MIN, x: 0, y: 0 } as const;
const VAR_X = '--lb-x';
const VAR_Y = '--lb-y';
const VAR_SCALE = '--lb-scale';
const VAR_ASPECT = '--lb-aspect';
const ZOOMED_ATTR = 'data-zoomed';
const DRAGGING_ATTR = 'data-dragging';
const FOCUSABLE =
  'button:not([disabled]), a[href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex="0"]';
const LIGHTBOX_TEXT = { close: 'Close' } as const;

export {
  DRAGGING_ATTR,
  FOCUSABLE,
  LIGHTBOX_TEXT,
  REST_ZOOM,
  VAR_ASPECT,
  VAR_SCALE,
  VAR_X,
  VAR_Y,
  WHEEL_LINE_PIXELS,
  WHEEL_SENSITIVITY,
  ZOOM_MAX,
  ZOOM_MIN,
  ZOOMED_ATTR,
};
