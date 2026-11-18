/* @layer renderer-components @kind component */
import { SearchInput } from '@drizztdourden08/tessera/primitives';
import { useT } from '@drizztdourden08/brock-react';
import { sectionGroup } from './studio-frame/section-group';
import { EffectRows } from './EffectRows';
import { SoundPanelShell } from './SoundPanelShell';
import { SoundSide } from './SoundSide';
import { effectsSummary } from './behavior/effects-summary';
import { useEffectsPanel } from './behavior/useEffectsPanel';
import type { MsuEffectsPanelProps } from './msu.type';

const MsuEffectsPanel = (props: MsuEffectsPanelProps) => {
  const { pack, manifest, saveBase, files, isLayered, readOnly, tabs, packPanel, onDeleteConfirm, onReload } = props;
  const t = useT();
  const panel = useEffectsPanel(props);
  const { filter, setFilter, panelOf, rows, open } = panel;
  const summary = effectsSummary(panel.first, panel.second);

  const openRow = open === null ? undefined : rows.find(({ channel, row }) => channel === open.channel && row.soundId === open.soundId);
  const detail = (
    <SoundSide
      open={openRow === undefined ? null : { channel: openRow.channel, row: openRow.row, sound: panelOf(openRow.channel) }}
      noteTitle={t('msu-studio:sound.effects.note-title')}
      note={t('msu-studio:sound.effects.note')}
      packPanel={packPanel}
      pack={pack}
      manifest={manifest}
      saveBase={saveBase}
      files={files}
      isLayered={isLayered}
      readOnly={readOnly}
      onPreview={panel.play}
      onPlayOriginal={panel.playOriginal}
      onStopReplacing={panel.confirmStopReplacing}
      onClose={(channel) => panelOf(channel).closeLayers()}
      onConfirm={onDeleteConfirm}
      onReload={onReload}
    />
  );

  const toolbar = [
    sectionGroup(t, tabs),
    {
      id: 'find',
      label: t('msu-studio:studio.toolbar.find'),
      content: (
        <SearchInput
          grow={false}
          value={filter}
          onChange={setFilter}
          placeholder={t('msu-studio:sound.filter.placeholder')}
          aria-label={t('msu-studio:sound.filter.aria')}
        />
      ),
    },
  ];

  return (
    <SoundPanelShell
      editorLabel={t('msu-studio:studio.editor.effects')}
      toolbar={toolbar}
      detail={detail}
      header={{
        title: t('msu-studio:sound.header.effects', { replaced: summary.replaced, total: summary.total }),
        sounding: summary.sounding,
        status: summary.status,
        statusOk: summary.statusOk,
        onStop: panel.stopAll,
      }}
    >
      <EffectRows panel={panel} />
    </SoundPanelShell>
  );
};

export { MsuEffectsPanel };
