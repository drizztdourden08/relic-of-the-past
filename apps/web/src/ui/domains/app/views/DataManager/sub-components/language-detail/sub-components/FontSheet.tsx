/* @layer renderer-components @kind component */
/**
 * The font is 256 8x8 2bpp tiles pairing into 128 characters of 8x16. For
 * character c: topTile = (c >> 4) * 32 + (c & 15), bottomTile = topTile + 16
 * (16 chars per row; each char-row spans two tile-rows).
 */
import { useRef, useEffect } from 'react';
import { Canvas } from '../../../../../../../design-system/primitives/Canvas';
import { decode2bppTile } from '@shared/asset-extraction/graphics/bitplane-decoder';
import type { FontSheetProps } from '../language-detail.type';

const COLS = 16;
const SCALE = 3;
const CHAR_W = 8;
const CHAR_H = 16;
const CELL_W = CHAR_W * SCALE;
const CELL_H = CHAR_H * SCALE;
const ALPHA = [0, 0.4, 0.7, 1];

const FontSheet = (props: FontSheetProps) => {
  const { tiles, glyphCount } = props;
  const ref = useRef<HTMLCanvasElement>(null);
  const rows = Math.ceil(glyphCount / COLS);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const data = Uint8Array.from(tiles);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = getComputedStyle(canvas).color;

    const paintTile = (tileIndex: number, ox: number, oy: number) => {
      const pixels = decode2bppTile(data, tileIndex * 16);
      for (let y = 0; y < 8; y++) {
        for (let x = 0; x < 8; x++) {
          const v = pixels[y * 8 + x];
          if (v === 0) continue;
          ctx.globalAlpha = ALPHA[v];
          ctx.fillRect(ox + x * SCALE, oy + y * SCALE, SCALE, SCALE);
        }
      }
    };

    for (let c = 0; c < glyphCount; c++) {
      const ox = (c % COLS) * CELL_W;
      const oy = Math.floor(c / COLS) * CELL_H;
      const topTile = (c >> 4) * 32 + (c & 15);
      paintTile(topTile, ox, oy);
      paintTile(topTile + 16, ox, oy + 8 * SCALE);
    }
    ctx.globalAlpha = 1;
  }, [tiles, glyphCount]);

  return (
    <Canvas
      ref={ref}
      width={COLS * CELL_W}
      height={rows * CELL_H}
      className="language-detail__font"
    />
  );
};

export { FontSheet };
