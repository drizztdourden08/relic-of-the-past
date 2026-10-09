/* @layer renderer-components @kind component */
import { useRef, useEffect } from 'react';
import { Box, Text, Canvas } from '@drizztdourden08/tessera/primitives';
import { drawSheet, SHEET_PNG_WIDTH, SHEET_PNG_HEIGHT, SHEET_ROWS } from '@app/lib/game/player-sheet/sheet-png';
import { SHEET_COLS } from '@rotp/game-data';
import type { SheetBrowserProps } from './SheetBrowser.type';
import './SheetBrowser.css';

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
