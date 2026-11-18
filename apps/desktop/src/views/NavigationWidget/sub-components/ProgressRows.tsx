/* @layer renderer-widgets @kind component */
import { useT } from '@drizztdourden08/brock-react';
import { Text } from '@drizztdourden08/tessera/primitives';
import { DescRow } from './DescRow';
import type { ProgressRowsProps } from './GameStatePanel.type';

const ProgressRows = ({ progressInfo, displayedVariant, dynamicBlockerCount }: ProgressRowsProps) => {
  const t = useT();
  return (
    <>
      {progressInfo && (
        <DescRow id="Phase" label={t('views-navigation:desc.phase.label')} desc={t('views-navigation:desc.phase.text')}>
          <Text className="nav-val-warning">{progressInfo.label}</Text>
          <Text className="nav-val-badge">0x{progressInfo.tier.toString(16).padStart(2, '0')}</Text>
        </DescRow>
      )}
      {displayedVariant && (
        <>
          <DescRow id="Tile Patch" label={t('views-navigation:desc.tilepatch.label')} desc={t('views-navigation:desc.tilepatch.text')}>
            {displayedVariant.eventOverlayActive
              ? <Text className="nav-val-green">{t('views-navigation:progress.active')}</Text>
              : <Text className="nav-val-muted">{t('views-navigation:progress.none')}</Text>}
          </DescRow>
          <DescRow id="Flags" label={t('views-navigation:desc.flags.label')} desc={t('views-navigation:desc.flags.text')}>
            <Text className="nav-val-dim">0x{displayedVariant.screenEventFlags.toString(16).padStart(2, '0')}</Text>
          </DescRow>
          <DescRow id="NPC Blockers" label={t('views-navigation:desc.npcblockers.label')} desc={t('views-navigation:desc.npcblockers.text')}>
            <Text className={dynamicBlockerCount > 0 ? 'nav-val-warning' : 'nav-val-muted'}>{dynamicBlockerCount}</Text>
          </DescRow>
        </>
      )}
    </>
  );
};

export { ProgressRows };
