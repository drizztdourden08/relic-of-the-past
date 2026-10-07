/* @layer tooling-scripts @kind logic */
/**
 * Turning a pixel-art SVG into the files an app needs. A square icon keeps the pixels crisp
 * where they can be: at two or more times the art's width the art is scaled by a whole
 * number and centred; smaller than that it is drawn smooth, since whole pixels no longer fit.
 */
import sharp from 'sharp';
import pngToIco from 'png-to-ico';

const SMOOTH_SOURCE_SCALE = 16;
const WHOLE_PIXELS_FROM = 2;

/** The art's own width and height, from its viewBox. */
const sizeOf = (svg) => {
  const [w, h] = svg.match(/viewBox="0 0 ([\d.]+) ([\d.]+)"/).slice(1).map(Number);
  return { w, h };
};

/** The art at a whole-number scale, every pixel a crisp square. */
const crisp = (svg, scale) => {
  const { w, h } = sizeOf(svg);
  return sharp(Buffer.from(svg)).resize(w * scale, h * scale, { kernel: 'nearest' }).png().toBuffer();
};

/** The art drawn smooth to fit inside `size` by `size`, from a large crisp render. */
const smooth = async (svg, size) => {
  const { w, h } = sizeOf(svg);
  const fit = Math.min(size / w, size / h);
  const big = await crisp(svg, SMOOTH_SOURCE_SCALE);
  return sharp(big).resize(Math.max(1, Math.round(w * fit)), Math.max(1, Math.round(h * fit)), { kernel: 'lanczos3' }).png().toBuffer();
};

/** A transparent `size` by `size` PNG with the art centred. */
const icon = async (svg, size) => {
  const { w, h } = sizeOf(svg);
  const scale = Math.floor(Math.min(size / w, size / h));
  const art = scale >= WHOLE_PIXELS_FROM ? await crisp(svg, scale) : await smooth(svg, size);
  const { width, height } = await sharp(art).metadata();
  return sharp({ create: { width: size, height: size, channels: 4, background: { r: 0, g: 0, b: 0, alpha: 0 } } })
    .composite([{ input: art, left: Math.floor((size - width) / 2), top: Math.floor((size - height) / 2) }])
    .png()
    .toBuffer();
};

/** A Windows .ico holding the art at each of `sizes`. */
const ico = async (svg, sizes) => pngToIco(await Promise.all(sizes.map((size) => icon(svg, size))));

export { sizeOf, crisp, icon, ico };
