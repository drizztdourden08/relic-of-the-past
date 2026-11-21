/* @layer renderer-components @kind component */
import { MsuPackList } from '../../../../msu-studio/MsuPackList';
import type { MsuListPaneProps } from './msu-manager.type';

const MsuListPane = (props: MsuListPaneProps) => {
  const { msu, selected, isInstalled, onSelect, onDelete } = props;

  return (
    <MsuPackList
      loading={msu.loadingPacks}
      packs={msu.packs}
      selected={selected}
      isInstalled={isInstalled}
      onSelect={onSelect}
      onDelete={onDelete}
    />
  );
};

export { MsuListPane };
