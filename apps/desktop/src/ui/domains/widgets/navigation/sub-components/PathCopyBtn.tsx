/* @layer renderer-widgets @kind component */
import { Box } from '../../../../design-system/primitives';
import { useNavigationOverlayStore } from '../../../../../stores/navigation-overlay-store';
import { S } from '../styles';

/** Copies the currently locked pathfinding path to the clipboard. */
const PathCopyBtn = () => {
  const lockedPath = useNavigationOverlayStore(s => s.lockedPath);
  if (!lockedPath || lockedPath.length === 0) {
    return <Box as="button" style={{ ...S.btn, ...S.btnDisabled }} disabled>📋 Path</Box>;
  }
  return (
    <Box as="button" style={S.btn} onClick={() => navigator.clipboard.writeText(lockedPath.map((t, i) => `${i}: [${t.row},${t.col}] 0x${t.attr.toString(16).padStart(2, '0')}`).join('\n'))}>
      📋 Path ({lockedPath.length})
    </Box>
  );
};

export { PathCopyBtn };
