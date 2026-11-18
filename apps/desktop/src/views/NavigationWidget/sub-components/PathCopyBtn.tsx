/* @layer renderer-widgets @kind component */
import { useT } from '@drizztdourden08/brock-react';
import { Button, Icon } from '@drizztdourden08/tessera/primitives';
import { useNavigationOverlayStore } from '../../../stores/navigation-overlay-store';

const PathCopyBtn = () => {
  const lockedPath = useNavigationOverlayStore(s => s.lockedPath);
  const t = useT();
  if (!lockedPath || lockedPath.length === 0) {
    return <Button variant="secondary" size="xs" icon={<Icon name="copy" />} disabled>{t('views-navigation:path.label')}</Button>;
  }
  return (
    <Button variant="secondary" size="xs" icon={<Icon name="copy" />} onClick={() => navigator.clipboard.writeText(lockedPath.map((tile, i) => `${i}: [${tile.row},${tile.col}] 0x${tile.attr.toString(16).padStart(2, '0')}`).join('\n'))}>
      {t('views-navigation:path.count', { count: lockedPath.length })}
    </Button>
  );
};

export { PathCopyBtn };
