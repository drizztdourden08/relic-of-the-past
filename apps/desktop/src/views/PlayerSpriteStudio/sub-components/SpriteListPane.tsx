/* @layer renderer-components @kind component */
import { useT } from '@drizztdourden08/brock-react';
import { CreateListPane } from '@app/compounds/CreateListPane';
import { SpriteLibraryList } from './SpriteLibraryList';
import type { SpriteListPaneProps } from '../PlayerSpriteStudio.type';

const SpriteListPane = ({ flow, library, actions, selected, error }: SpriteListPaneProps) => {
  const t = useT();
  return (
  <CreateListPane label={t('views-player-sprite-studio:list.new')} creating={flow.creating} onCreate={flow.start}>
    <SpriteLibraryList
      entries={library.entries}
      loading={library.loading}
      selected={selected}
      error={error}
      isInstalled={actions.isInstalled}
      onSelect={flow.select}
      onDelete={actions.handleDelete}
    />
  </CreateListPane>
  );
};

export { SpriteListPane };
