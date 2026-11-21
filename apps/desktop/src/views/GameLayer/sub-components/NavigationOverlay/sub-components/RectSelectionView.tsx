/* @layer renderer-components @kind component */
import { useMemo } from 'react';
import { useT } from '@drizztdourden08/brock-react';
import { Box } from '@drizztdourden08/tessera/primitives';
import type { RectSelectionViewProps } from './RectSelectionView.type';

const RectSelectionView = ({ selectionRect, rectSel, copied }: RectSelectionViewProps) => {
  const t = useT();
  const selectionStyle = useMemo(() => (selectionRect ? {
    left: selectionRect.x, top: selectionRect.y,
    width: selectionRect.w, height: selectionRect.h,
  } : undefined), [selectionRect]);
  const showToast = copied && rectSel !== null && !rectSel.active;

  return (
    <>
      {selectionRect && <Box className="nav-overlay__selection" style={selectionStyle} />}
      {showToast && (
        <Box className="nav-overlay__toast">
          {t('views-game-layer:overlay.tiles-copied', { count: selectionRect?.tileCount ?? 0 })}
        </Box>
      )}
    </>
  );
};

export { RectSelectionView };
