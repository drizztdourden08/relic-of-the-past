/* @layer renderer-components @kind component */
import { Box, Button, EmptyState, Field, SectionHeader, Text, TextInput } from '@drizztdourden08/tessera/primitives';
import { SoundListItem } from './SoundListItem';
import { useEffectsPanel } from './behavior/useEffectsPanel';
import { SOUND_FILTER_HINT, SOUND_FILTER_PLACEHOLDER } from './msu.constants';
import { soundPreviewKey } from './behavior/preview-key';
import { EFFECTS_SUBTITLE } from './MsuEffectsPanel.constants';
import type { MsuEffectsPanelProps } from './msu.type';

const MsuEffectsPanel = (props: MsuEffectsPanelProps) => {
  const { pack, manifest, saveBase, files, isLayered, readOnly, onDeleteConfirm, onReload } = props;
  const panel = useEffectsPanel(props);
  const { filter, setFilter, first, second, panelOf, rows } = panel;
  const availableFiles = files.map((file) => file.name);

  const replaced = first.replacedCount + second.replacedCount;
  const total = first.total + second.total;
  const sounding = first.playing !== null || second.playing !== null
    || first.playingOriginal !== null || second.playingOriginal !== null;
  const status = first.statusMessage ?? second.statusMessage;
  const statusOk = first.statusOk && second.statusOk;

  return (
    <Box className="msu-panel">
      <SectionHeader
        title={`Effects · ${replaced} of ${total} replaced`}
        subtitle={EFFECTS_SUBTITLE}
        action={sounding ? <Button variant="tertiary" size="sm" onClick={panel.stopAll}>Stop preview</Button> : null}
      />

      <Field label="Find a sound" hint={`${SOUND_FILTER_HINT} Add SFX1 or SFX2 to narrow to one port.`}>
        <TextInput
          type="text"
          placeholder={SOUND_FILTER_PLACEHOLDER}
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
        />
      </Field>

      {status != null && (
        <Text className={`msu-status${statusOk ? '' : ' msu-status--error'}`}>{status}</Text>
      )}

      {rows.length === 0 ? (
        <EmptyState message={`No effect on either port matches "${filter}"`} />
      ) : (
        <Box className="track-list">
          {rows.map(({ channel, row }) => (
            <SoundListItem
              key={soundPreviewKey(channel, row.soundId)}
              pack={pack}
              channel={channel}
              row={row}
              sound={panelOf(channel)}
              manifest={manifest}
              saveBase={saveBase}
              availableFiles={availableFiles}
              isLayered={isLayered}
              showChannel
              readOnly={readOnly}
              onPreview={panel.play}
              onPlayOriginal={panel.playOriginal}
              onToggleLayers={panel.toggleLayers}
              onStopReplacing={(soundId) => panel.confirmStopReplacing(channel, soundId)}
              onConfirm={onDeleteConfirm}
              onReload={onReload}
            />
          ))}
        </Box>
      )}
    </Box>
  );
};

export { MsuEffectsPanel };
