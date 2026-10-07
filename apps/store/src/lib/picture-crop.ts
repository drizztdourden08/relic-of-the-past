/* @layer store-site @kind logic */
/**
 * The part of a picked picture the store keeps, in the picture's own pixels. The crop always
 * has the target's shape; `zoom` 1 is the largest such crop that fits the picture, and a
 * higher zoom a smaller one around the same centre. Every crop is held inside the picture.
 */
type Size = { width: number; height: number };

type CropRect = { x: number; y: number; width: number; height: number };

const MAX_ZOOM = 4;

const clamp = (value: number, low: number, high: number) => Math.min(Math.max(value, low), high);

/** The largest rectangle of `ratio` (width over height) that fits in `picture`. */
const coverSize = (picture: Size, ratio: number): Size =>
  (picture.width / picture.height > ratio
    ? { width: picture.height * ratio, height: picture.height }
    : { width: picture.width, height: picture.width / ratio });

/** Moves the crop back inside the picture. */
const clampCrop = (crop: CropRect, picture: Size): CropRect => ({
  ...crop,
  x: clamp(crop.x, 0, picture.width - crop.width),
  y: clamp(crop.y, 0, picture.height - crop.height),
});

/** A crop of `ratio` at `zoom`, centred on `centre` (the picture's centre by default). */
const cropAt = (picture: Size, ratio: number, zoom = 1, centre?: readonly [number, number]): CropRect => {
  const base = coverSize(picture, ratio);
  const scale = clamp(zoom, 1, MAX_ZOOM);
  const width = base.width / scale;
  const height = base.height / scale;
  const [cx, cy] = centre ?? [picture.width / 2, picture.height / 2];
  return clampCrop({ x: cx - width / 2, y: cy - height / 2, width, height }, picture);
};

const zoomOf = (crop: CropRect, picture: Size, ratio: number): number => coverSize(picture, ratio).width / crop.width;

const centreOf = (crop: CropRect): [number, number] => [crop.x + crop.width / 2, crop.y + crop.height / 2];

/** The crop moved by a distance in picture pixels. */
const moveCrop = (crop: CropRect, dx: number, dy: number, picture: Size): CropRect =>
  clampCrop({ ...crop, x: crop.x + dx, y: crop.y + dy }, picture);

/** The crop at a new zoom, keeping its centre. */
const zoomCrop = (crop: CropRect, zoom: number, picture: Size, ratio: number): CropRect =>
  cropAt(picture, ratio, zoom, centreOf(crop));

export { MAX_ZOOM, cropAt, moveCrop, zoomCrop, zoomOf };
export type { CropRect, Size };
