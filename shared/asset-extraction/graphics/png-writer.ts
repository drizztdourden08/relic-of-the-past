/* @layer shared-asset-extraction @kind logic */
/**
 * PNG image creation using pngjs.
 * Replaces Python's PIL Image for sprite/tile output.
 */
import { PNG } from 'pngjs';
import { writeFileSync, mkdirSync } from 'fs';
import { dirname } from 'path';
import type { RGBA } from './palette';

/**
 * Simple RGBA image buffer for compositing tiles before PNG export.
 */
class ImageBuffer {
  readonly width: number;
  readonly height: number;
  /** Raw RGBA pixel data (4 bytes per pixel, row-major) */
  readonly data: Buffer;

  constructor(width: number, height: number) {
    this.width = width;
    this.height = height;
    this.data = Buffer.alloc(width * height * 4);
  }

  /** Set a single pixel. Coordinates are unchecked for performance. */
  putPixel(x: number, y: number, color: RGBA): void {
    const offset = (y * this.width + x) * 4;
    this.data[offset] = color[0];
    this.data[offset + 1] = color[1];
    this.data[offset + 2] = color[2];
    this.data[offset + 3] = color[3];
  }

  /** Get a single pixel. */
  getPixel(x: number, y: number): RGBA {
    const offset = (y * this.width + x) * 4;
    return [
      this.data[offset],
      this.data[offset + 1],
      this.data[offset + 2],
      this.data[offset + 3],
    ];
  }

  /**
   * Paste another image onto this one at (dx, dy).
   * Only non-transparent pixels are pasted (alpha > 0).
   */
  paste(src: ImageBuffer, dx: number, dy: number): void {
    for (let y = 0; y < src.height; y++) {
      for (let x = 0; x < src.width; x++) {
        const srcOffset = (y * src.width + x) * 4;
        if (src.data[srcOffset + 3] === 0) continue;
        const dstOffset = ((dy + y) * this.width + (dx + x)) * 4;
        this.data[dstOffset] = src.data[srcOffset];
        this.data[dstOffset + 1] = src.data[srcOffset + 1];
        this.data[dstOffset + 2] = src.data[srcOffset + 2];
        this.data[dstOffset + 3] = src.data[srcOffset + 3];
      }
    }
  }

  /** Flip horizontally (in-place, returns this for chaining) */
  flipX(): ImageBuffer {
    const flipped = new ImageBuffer(this.width, this.height);
    for (let y = 0; y < this.height; y++) {
      for (let x = 0; x < this.width; x++) {
        const srcOffset = (y * this.width + x) * 4;
        const dstOffset = (y * this.width + (this.width - 1 - x)) * 4;
        flipped.data[dstOffset] = this.data[srcOffset];
        flipped.data[dstOffset + 1] = this.data[srcOffset + 1];
        flipped.data[dstOffset + 2] = this.data[srcOffset + 2];
        flipped.data[dstOffset + 3] = this.data[srcOffset + 3];
      }
    }
    return flipped;
  }

  /** Flip vertically (returns new buffer) */
  flipY(): ImageBuffer {
    const flipped = new ImageBuffer(this.width, this.height);
    for (let y = 0; y < this.height; y++) {
      for (let x = 0; x < this.width; x++) {
        const srcOffset = (y * this.width + x) * 4;
        const dstOffset = ((this.height - 1 - y) * this.width + x) * 4;
        flipped.data[dstOffset] = this.data[srcOffset];
        flipped.data[dstOffset + 1] = this.data[srcOffset + 1];
        flipped.data[dstOffset + 2] = this.data[srcOffset + 2];
        flipped.data[dstOffset + 3] = this.data[srcOffset + 3];
      }
    }
    return flipped;
  }

  /** Scale up by integer factor (nearest-neighbor) */
  scale(factor: number): ImageBuffer {
    const scaled = new ImageBuffer(this.width * factor, this.height * factor);
    for (let y = 0; y < this.height; y++) {
      for (let x = 0; x < this.width; x++) {
        const srcOffset = (y * this.width + x) * 4;
        const r = this.data[srcOffset];
        const g = this.data[srcOffset + 1];
        const b = this.data[srcOffset + 2];
        const a = this.data[srcOffset + 3];
        for (let dy = 0; dy < factor; dy++) {
          for (let dx = 0; dx < factor; dx++) {
            const dstOffset = ((y * factor + dy) * scaled.width + (x * factor + dx)) * 4;
            scaled.data[dstOffset] = r;
            scaled.data[dstOffset + 1] = g;
            scaled.data[dstOffset + 2] = b;
            scaled.data[dstOffset + 3] = a;
          }
        }
      }
    }
    return scaled;
  }

  /** Encode to PNG buffer */
  toPngBuffer(): Buffer {
    const png = new PNG({ width: this.width, height: this.height });
    this.data.copy(png.data);
    return PNG.sync.write(png);
  }

  /** Write to PNG file (creates directories if needed) */
  savePng(filePath: string): void {
    mkdirSync(dirname(filePath), { recursive: true });
    writeFileSync(filePath, this.toPngBuffer());
  }
}

export { ImageBuffer };
