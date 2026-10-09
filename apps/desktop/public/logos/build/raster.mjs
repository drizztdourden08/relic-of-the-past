/* @layer tooling-scripts @kind logic */
import sharp from 'sharp';
import pngToIco from 'png-to-ico';

const SMOOTH_SOURCE_SCALE = 16;
const WHOLE_PIXELS_FROM = 2;

const sizeOf = (svg) => {
  const [w, h] = svg.match(/viewBox="0 0 ([\d.]+) ([\d.]+)"/).slice(1).map(Number);
  return { w, h };
};

const crisp = (svg, scale) => {
  const { w, h } = sizeOf(svg);
  return sharp(Buffer.from(svg)).resize(w * scale, h * scale, { kernel: 'nearest' }).png().toBuffer();
};

const smooth = async (svg, size) => {
  const { w, h } = sizeOf(svg);
  const fit = Math.min(size / w, size / h);
  const big = await crisp(svg, SMOOTH_SOURCE_SCALE);
  return sharp(big).resize(Math.max(1, Math.round(w * fit)), Math.max(1, Math.round(h * fit)), { kernel: 'lanczos3' }).png().toBuffer();
};

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

const ico = async (svg, sizes) => pngToIco(await Promise.all(sizes.map((size) => icon(svg, size))));

export { sizeOf, crisp, icon, ico };
