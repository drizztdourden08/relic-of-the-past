/* @layer renderer-components @kind component */
import { useRef, useEffect } from 'react';
import { Box, Text, Canvas } from '@drizztdourden08/tessera/primitives';
import { drawSheet, SHEET_PNG_WIDTH, SHEET_PNG_HEIGHT, SHEET_ROWS } from '@rotp/packs';
import { SHEET_COLS } from '@rotp/game-data';
import { poseLabelsOf } from '../../behavior/pose-labels';
import type { SheetBrowserProps } from './SheetBrowser.type';
import './SheetBrowser.css';

const SheetBrowser = (props: SheetBrowserProps) => {
  const { sheet, wearing, scale, labels } = props;
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const ctx = ref.current?.getContext('2d');
    if (ctx) drawSheet(sheet, wearing, ctx);
  }, [sheet, wearing]);

  return (
    <Box className="sheet-browser">
      <Text className="sheet-browser__meta">
        {poseLabelsOf(labels).sheetSize(SHEET_COLS, SHEET_ROWS, SHEET_PNG_WIDTH, SHEET_PNG_HEIGHT)}
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
