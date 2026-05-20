/**
 * PauseMenuView — Positional placeholder containers matching the vanilla
 * ALTTP pause menu layout 1:1, accounting for widescreen/extend_y configs.
 *
 * Tile coordinates from Hud_DrawBox calls in hud.c:
 *   Items:     (1,5)→(19,19)   = 19×15 tiles
 *   Name:      (21,5)→(30,10)  = 10×6 tiles
 *   Progress:  (21,11)→(30,19) = 10×9 tiles
 *   Pendants/Crystals drawn via Hud_DrawNxN
 *   Abilities: (1,21)→(19,29)  = 19×9 tiles
 *   Equipment: (21,21)→(30,29) = 10×9 tiles
 *
 * Screen formula (when BG3 scroll fully open = 24px):
 *   snes_x = tile_x × 8
 *   snes_y = tile_y × 8 − 24
 *
 * For widescreen: the 256px BG3 content is centered in the wider viewport.
 *   x_offset = (native_w − 256) / 2
 */

import { useEffect, useRef, useState } from 'react';

/** Standard SNES menu content area */
const MENU_W = 256;
const MENU_H = 224;

interface BoxProps {
  x: number;
  y: number;
  w: number;
  h: number;
  label?: string;
  scale: number;
  xOffset: number;
}

function Box({ x, y, w, h, label, scale, xOffset }: BoxProps) {
  return (
    <div
      style={{
        position: 'absolute',
        left: (x + xOffset) * scale,
        top: y * scale,
        width: w * scale,
        height: h * scale,
        border: `${Math.max(1, scale)}px solid red`,
        boxSizing: 'border-box',
      }}
    >
      {label && (
        <span
          style={{
            position: 'absolute',
            top: 2,
            left: 4,
            fontSize: Math.max(8, 6 * scale),
            color: 'red',
            fontFamily: 'monospace',
            lineHeight: 1,
            whiteSpace: 'nowrap',
          }}
        >
          {label}
        </span>
      )}
    </div>
  );
}

function PauseMenuView() {
  return (
    <div style={{ position: 'absolute', inset: 0 }}>
      <PauseMenuBoxes />
    </div>
  );
}

function PauseMenuBoxes() {
  const [scale, setScale] = useState(1);
  const [xOffset, setXOffset] = useState(0);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const update = () => {
      const h = el.clientHeight;
      if (h <= 0) return;

      // Read the game canvas buffer to determine native resolution
      const canvas = document.getElementById('canvas') as HTMLCanvasElement | null;
      const nativeW = canvas ? canvas.width / 2 : MENU_W;
      const nativeH = canvas ? canvas.height / 2 : MENU_H;

      // Scale: maps native pixels to display pixels
      setScale(h / nativeH);
      // BG3 content (256px wide) is centered in the wider viewport
      setXOffset((nativeW - MENU_W) / 2);
    };
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  return (
    <div ref={ref} style={{ position: 'absolute', inset: 0 }}>
      {/* Y-Button Item Grid: tiles (1,5)→(19,19) */}
      <Box x={8} y={16} w={152} h={120} label="Items" scale={scale} xOffset={xOffset} />

      {/* Selected Item Name Box: tiles (21,5)→(30,10) */}
      <Box x={168} y={16} w={80} h={48} label="Name" scale={scale} xOffset={xOffset} />

      {/* Progress Icons (Pendants/Crystals): tiles (21,11)→(30,19) */}
      <Box x={168} y={64} w={80} h={72} label="Progress" scale={scale} xOffset={xOffset} />

      {/* Ability Box: tiles (1,21)→(19,29) */}
      <Box x={8} y={144} w={152} h={72} label="Abilities" scale={scale} xOffset={xOffset} />

      {/* Equipment Box: tiles (21,21)→(30,29) */}
      <Box x={168} y={144} w={80} h={72} label="Equipment" scale={scale} xOffset={xOffset} />
    </div>
  );
}

export { PauseMenuView };
