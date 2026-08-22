/* @layer renderer-components @kind component */
import { useRef, useEffect } from 'react';
import { Box } from '@ds/primitives/Box';
import { Text } from '@ds/primitives/Text';
import { Canvas } from '@ds/primitives/Canvas';
import type { PlayerSheet, Wearing } from '@shared/game/data/player-sheet/types';
import { drawSheet, SHEET_PNG_WIDTH, SHEET_PNG_HEIGHT, SHEET_ROWS } from '@app/lib/game/player-sheet/sheet-png';
import { SHEET_COLS } from '@shared/game/data/player-sheet/types';

interface SheetBrowserProps {
  sheet: PlayerSheet;
  wearing: Wearing;
  scale: number;
}

/** The raw tile grid, for checking a pose against the art it was assembled from. */
const SheetBrowser = (props: SheetBrowserProps) => {
  const { sheet, wearing, scale } = props;
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const ctx = ref.current?.getContext('2d');
    if (ctx) drawSheet(sheet, wearing, ctx);
  }, [sheet, wearing]);

  return (
    <Box className="sheet-browser">
      <Text className="sheet-browser__meta">
        {SHEET_COLS} x {SHEET_ROWS} tiles &middot; {SHEET_PNG_WIDTH} x {SHEET_PNG_HEIGHT} px
      </Text>
      <Canvas
        ref={ref}
        width={SHEET_PNG_WIDTH}
        height={SHEET_PNG_HEIGHT}
        className="sheet-browser__canvas"
        style={{ width: SHEET_PNG_WIDTH * scale, height: SHEET_PNG_HEIGHT * scale }}
      />
    </Box>
  );
};

export { SheetBrowser };
export type { SheetBrowserProps };
