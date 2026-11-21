/* @layer renderer-components @kind component */
import { useCallback } from 'react';
import { useT } from '@drizztdourden08/brock-react';
import { Spinner, Text } from '@drizztdourden08/tessera/primitives';
import { storeItemUrl } from '@rotp/hub-client';
import type { StoreDetailPanelProps } from '../Store.type';
import { useDetailBar } from '../behavior/useDetailBar';
import { StoreDetail } from './StoreDetail';

const StoreDetailPanel = (props: StoreDetailPanelProps) => {
  const { store } = props;
  const t = useT();
  const { selectedId, detail, detailError, selectedPack } = store;
  const bar = useDetailBar(store);

  const handleOpenSite = useCallback(() => {
    if (selectedId) window.open(storeItemUrl(selectedId), '_blank');
  }, [selectedId]);

  if (!selectedId) return <Text>{t('views-store:browse.selectPack')}</Text>;
  if (detailError) return <Text as="p" className="store__error">{detailError}</Text>;
  if (!detail) return <Spinner size="sm" />;

  return <StoreDetail detail={detail} pack={selectedPack} bar={bar} onOpenSite={handleOpenSite} />;
};

export { StoreDetailPanel };
