/* @layer renderer-widgets @kind component */
import { useT } from '@drizztdourden08/brock-react';
import { useState, useEffect, useRef } from 'react';
import { Button, Icon } from '@drizztdourden08/tessera/primitives';
import { wasmGetViewportInfo } from '../../../game';

const TileRecorderBtn = ({ attrGrid, overworldScreenIndex }: { attrGrid: number[][] | null; overworldScreenIndex: number }) => {
  const t = useT();
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
      if (vp?.locationModule === 9) {
        const screenWorldX = (overworldScreenIndex & 7) * 512;
        const screenWorldY = (((overworldScreenIndex >> 3) & 7)) * 512;
        const tileCol = Math.floor((vp.linkX - screenWorldX) / 8);
        const tileRow = Math.floor((vp.linkY - screenWorldY) / 8);
        if (tileRow >= 0 && tileRow < 64 && tileCol >= 0 && tileCol < 64) {
          const key = `${tileRow},${tileCol}`;
          const attr = attrGrid[tileRow]?.[tileCol];
          if (attr !== undefined && key !== lastTile.current) {
            lastTile.current = key;
            setTiles(prev => [...prev, { row: tileRow, col: tileCol, attr }]);
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
      <Button variant="secondary" size="xs" active={recording} icon={<Icon name={recording ? 'square' : 'circle-dot'} />} onClick={toggle} disabled={!attrGrid}>
        {t('views-navigation:recorder.rec')}
      </Button>
      {tiles.length > 0 && !recording && (
        <Button variant="secondary" size="xs" icon={<Icon name="copy" />} onClick={() => navigator.clipboard.writeText(tiles.map(tile => `[${tile.row},${tile.col}] 0x${tile.attr.toString(16).padStart(2, '0')}`).join('\n'))}>
          {t('views-navigation:recorder.tiles')}
        </Button>
      )}
    </>
  );
};

export { TileRecorderBtn };
