/* @layer shared-asset-extraction @kind logic */
import { PNG } from 'pngjs';
import type { RGBA } from './palette';

class ImageBuffer {
  readonly width: number;
  readonly height: number;
  readonly data: Buffer;

  constructor(width: number, height: number) {
    this.width = width;
    this.height = height;
    this.data = Buffer.alloc(width * height * 4);
  }

  putPixel(x: number, y: number, color: RGBA): void {
    const offset = (y * this.width + x) * 4;
    this.data[offset] = color[0];
    this.data[offset + 1] = color[1];
    this.data[offset + 2] = color[2];
    this.data[offset + 3] = color[3];
  }

  getPixel(x: number, y: number): RGBA {
    const offset = (y * this.width + x) * 4;
    return [
      this.data.readUInt8(offset),
      this.data.readUInt8(offset + 1),
      this.data.readUInt8(offset + 2),
      this.data.readUInt8(offset + 3),
    ];
  }

  paste(src: ImageBuffer, dx: number, dy: number): void {
    for (let y = 0; y < src.height; y++) {
      for (let x = 0; x < src.width; x++) {
        const srcOffset = (y * src.width + x) * 4;
        if (src.data[srcOffset + 3] === 0) continue;
        const dstOffset = ((dy + y) * this.width + (dx + x)) * 4;
        this.data[dstOffset] = src.data.readUInt8(srcOffset);
        this.data[dstOffset + 1] = src.data.readUInt8(srcOffset + 1);
        this.data[dstOffset + 2] = src.data.readUInt8(srcOffset + 2);
        this.data[dstOffset + 3] = src.data.readUInt8(srcOffset + 3);
      }
    }
  }

  flipX(): ImageBuffer {
    const flipped = new ImageBuffer(this.width, this.height);
    for (let y = 0; y < this.height; y++) {
      for (let x = 0; x < this.width; x++) {
        const srcOffset = (y * this.width + x) * 4;
        const dstOffset = (y * this.width + (this.width - 1 - x)) * 4;
        this.data.copy(flipped.data, dstOffset, srcOffset, srcOffset + 4);
      }
    }
    return flipped;
  }

  flipY(): ImageBuffer {
    const flipped = new ImageBuffer(this.width, this.height);
    for (let y = 0; y < this.height; y++) {
      for (let x = 0; x < this.width; x++) {
        const srcOffset = (y * this.width + x) * 4;
        const dstOffset = ((this.height - 1 - y) * this.width + x) * 4;
        this.data.copy(flipped.data, dstOffset, srcOffset, srcOffset + 4);
      }
    }
    return flipped;
  }

  scale(factor: number): ImageBuffer {
    const scaled = new ImageBuffer(this.width * factor, this.height * factor);
    for (let y = 0; y < scaled.height; y++) {
      for (let x = 0; x < scaled.width; x++) {
        const srcOffset = (Math.floor(y / factor) * this.width + Math.floor(x / factor)) * 4;
        this.data.copy(scaled.data, (y * scaled.width + x) * 4, srcOffset, srcOffset + 4);
      }
    }
    return scaled;
  }

  toPngBuffer(): Buffer {
    const png = new PNG({ width: this.width, height: this.height });
    this.data.copy(png.data);
    return PNG.sync.write(png);
  }
}

export { ImageBuffer };
