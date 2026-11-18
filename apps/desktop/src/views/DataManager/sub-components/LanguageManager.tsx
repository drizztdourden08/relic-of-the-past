/* @layer renderer-components @kind component */
import { useT } from '@drizztdourden08/brock-react';
import { EmptyState, Text } from '@drizztdourden08/tessera/primitives';
import { ListDetailLayout } from '@drizztdourden08/tessera/composites';
import { CreateListPane } from '@app/compounds/CreateListPane';
import { useCreateFlow } from '@app/hooks/useCreateFlow';
import { useInstalledKind } from '@app/hooks/useInstalledKind';
import { InstalledOriginBar, useConfirmUninstall } from '@app/views/InstalledOriginBar';
import { LanguageCreateWizard } from './language-manager/LanguageCreateWizard';
import { useLanguageDelete } from './language-manager/useLanguageDelete';
import { useLanguageManagerDisplay } from './language-manager/useLanguageManagerDisplay';
import { useLanguageSets } from './language-manager/useLanguageSets';
import type { LanguageManagerProps } from './LanguageManager.type';
import { LanguageEditor } from '../../../language-editor';
import { NO_SET_MESSAGE } from '../../../language-editor/sub-components/studio-frame/studio-frame.constants';
import { LanguageSetList } from './LanguageSetList';

const LanguageManager = (props: LanguageManagerProps) => {
  const t = useT();
  const t = useT();
  const { onDeleteConfirm } = props;
  const { languages, loading, selected, setSelected, refresh, refreshThenSelect } = useLanguageSets();
  const flow = useCreateFlow({ onSelect: setSelected });
  const { pack: installed, packFor } = useInstalledKind('language', selected);
  const { confirmUninstall, uninstallError } = useConfirmUninstall(onDeleteConfirm);
  const { handleDelete, handleUninstalled } = useLanguageDelete({
    selected, setSelected, refresh, packFor, confirmUninstall, onDeleteConfirm,
  });

  const { setLabel, isInstalled, ownSets } = useLanguageManagerDisplay({ languages, packFor });

  const origin = installed === null ? null : <InstalledOriginBar pack={installed} onDuplicated={refreshThenSelect} onUpdateInstalled={refreshThenSelect} onUninstalled={handleUninstalled} />;
  const notice = uninstallError === null ? null : <Text variant="caption" tone="danger" role="alert">{uninstallError}</Text>;

  const list = (
    <CreateListPane label={t('data-manager:language-manager.new-language')} creating={flow.creating} onCreate={flow.start} notice={notice}>
      <LanguageSetList sets={languages} loading={loading} selected={flow.creating ? null : selected} labelOf={setLabel}
        isInstalled={isInstalled} onSelect={flow.select} onDelete={handleDelete} />
    </CreateListPane>
  );

  const detail = flow.creating ? (
    <LanguageCreateWizard sets={languages} baseSets={ownSets} refresh={refresh} onCancel={flow.cancel} onCreated={flow.select} />
  ) : selected && <LanguageEditor key={selected} id={selected} readOnly={installed !== null} origin={origin} />;

  return (
    <ListDetailLayout listShowTitle={false}
      listContainers={[{ title: 'Language sets', content: list }]}
      collapsed={flow.listCollapsed}
      onCollapsedChange={flow.setListCollapsed}
      detail={detail}
      emptyDetail={<EmptyState message={NO_SET_MESSAGE} />}
      detailScroll={false}
      storageKey="language-studio.list"
      listLabel={t('data-manager:language-manager.language-studio')}
      detailLabel="Language editor"
    />
  );
};

export { LanguageManager };
