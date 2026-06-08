/* @layer renderer-widgets @kind component */
import { useState, useEffect, useRef } from 'react';
import { Box } from '../../../../design-system/primitives';
import { wasmGetViewportInfo } from '../../../../../lib/game';
import { S } from '../styles';

/** Records the attr value of each tile Link walks over (debug aid). */
const TileRecorderBtn = ({ attrGrid, overworldScreenIndex }: { attrGrid: number[][] | null; overworldScreenIndex: number }) => {
  const [recording, setRecording] = useState(false);
  const [tiles, setTiles] = useState<Array<{ row: number; col: number; attr: number }>>([]);
  const lastTile = useRef<string>('');
  const rafRef = useRef<number>(0);

  useEffect(() => {
    if (!recording || !attrGrid) {
      cancelAnimationFrame(rafRef.current);
      return;
    }
    const poll = () => {
      const vp = wasmGetViewportInfo();
      if (vp && vp.locationModule === 9) {
        const screenWorldX = (overworldScreenIndex & 7) * 512;
        const screenWorldY = (((overworldScreenIndex >> 3) & 7)) * 512;
        const tileCol = Math.floor((vp.linkX - screenWorldX) / 8);
        const tileRow = Math.floor((vp.linkY - screenWorldY) / 8);
        if (tileRow >= 0 && tileRow < 64 && tileCol >= 0 && tileCol < 64) {
          const key = `${tileRow},${tileCol}`;
          if (key !== lastTile.current) {
            lastTile.current = key;
            setTiles(prev => [...prev, { row: tileRow, col: tileCol, attr: attrGrid[tileRow][tileCol] }]);
          }
        }
      }
      rafRef.current = requestAnimationFrame(poll);
    };
    rafRef.current = requestAnimationFrame(poll);
    return () => cancelAnimationFrame(rafRef.current);
  }, [recording, attrGrid, overworldScreenIndex]);

  const toggle = () => {
    if (recording) setRecording(false);
    else { setTiles([]); lastTile.current = ''; setRecording(true); }
  };

  return (
    <>
      <Box as="button" style={{ ...S.btn, ...(attrGrid ? {} : S.btnDisabled) }} onClick={toggle} disabled={!attrGrid}>
        {recording ? '⏹ Rec' : '⏺ Rec'}
      </Box>
      {tiles.length > 0 && !recording && (
        <Box as="button" style={S.btn} onClick={() => navigator.clipboard.writeText(tiles.map(t => `[${t.row},${t.col}] 0x${t.attr.toString(16).padStart(2, '0')}`).join('\n'))}>
          📋 Tiles
        </Box>
      )}
    </>
  );
};

export { TileRecorderBtn };
