/* @layer renderer-components @kind component */
import { Box, SearchInput } from '@drizztdourden08/tessera/primitives';
import { StudioBody } from '@app/studio';
import { EffectRows } from './EffectRows';
import { SoundListHeader } from './SoundListHeader';
import { SoundSide } from './SoundSide';
import { effectsSummary } from './behavior/effects-summary';
import { useEffectsPanel } from './behavior/useEffectsPanel';
import { SOUND_FILTER_PLACEHOLDER } from './msu.constants';
import { EFFECTS_NOTE } from './MsuEffectsPanel.constants';
import { DETAILS_PANEL, EDITOR_LABELS } from './studio-frame/studio-frame.constants';
import type { MsuEffectsPanelProps } from './msu.type';

const MsuEffectsPanel = (props: MsuEffectsPanelProps) => {
  const { pack, manifest, saveBase, files, isLayered, readOnly, tabs, packPanel, onDeleteConfirm, onReload } = props;
  const panel = useEffectsPanel(props);
  const { filter, setFilter, panelOf, rows, open } = panel;
  const summary = effectsSummary(panel.first, panel.second);

  const openRow = open === null ? undefined : rows.find(({ channel, row }) => channel === open.channel && row.soundId === open.soundId);
  const detail = (
    <SoundSide
      open={openRow === undefined ? null : { channel: openRow.channel, row: openRow.row, sound: panelOf(openRow.channel) }}
      noteTitle="Effects"
      note={EFFECTS_NOTE}
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

  const toolbar = (
    <>
      {tabs}
      <SearchInput grow={false} size="sm" value={filter} onChange={setFilter} placeholder={SOUND_FILTER_PLACEHOLDER} aria-label="Find a sound" />
    </>
  );

  return (
    <StudioBody editorLabel={EDITOR_LABELS.effects} toolbar={toolbar} end={{ ...DETAILS_PANEL, content: detail }}>
      <Box className="msu-panel">
        <SoundListHeader
          title={`Effects · ${summary.replaced} of ${summary.total} replaced`}
          sounding={summary.sounding}
          status={summary.status}
          statusOk={summary.statusOk}
          onStop={panel.stopAll}
        />
        <EffectRows panel={panel} />
      </Box>
    </StudioBody>
  );
};

export { MsuEffectsPanel };
