/* @layer renderer-components @kind component */
import { LayerEditor } from './LayerEditor';
import { SoundAudioSection } from './SoundAudioSection';
import { SoundDetailHead } from './SoundDetailHead';
import { soundTarget } from './behavior/layer-target';
import type { SoundDetailProps } from './SoundDetail.type';

const SoundDetail = (props: SoundDetailProps) => {
  const { pack, channel, row, sound, manifest, saveBase, files, isLayered, readOnly, onConfirm, onReload } = props;
  const target = soundTarget(channel, row.soundId);

  return (
    <>
      <SoundDetailHead {...props} />
      <SoundAudioSection pack={pack} channel={channel} row={row} sound={sound} manifest={manifest} saveBase={saveBase} readOnly={readOnly} onReload={onReload} />
      <LayerEditor
        key={`${pack}:${target.previewKey}`}
        pack={pack}
        target={target}
        manifest={manifest}
        saveBase={saveBase}
        availableFiles={files.map((file) => file.name)}
        isLayered={isLayered}
        reportStore={sound.reportStore}
        onConfirm={onConfirm}
        onSaved={onReload}
        readOnly={readOnly}
      />
    </>
  );
};

export { SoundDetail };
