/* @layer renderer-components @kind component */
import { useEffect, useState } from 'react';
import { Box, Field, TextInput } from '@drizztdourden08/tessera/primitives';
import { useT } from '@drizztdourden08/brock-react';
import { writeMsuManifest } from '@app/storage/msu-store';
import { withSoundGroup } from './behavior/sound-manifest';
import type { SoundGroupFieldProps } from './SoundGroupField.type';

const SoundGroupField = (props: SoundGroupFieldProps) => {
  const { pack, channel, soundId, group, saveBase, disabled = false, onSaved } = props;
  const t = useT();
  const [draft, setDraft] = useState(group ?? '');

  useEffect(() => { setDraft(group ?? ''); }, [group]);

  const commit = (): void => {
    const wanted = draft.trim();
    if (wanted === (group ?? '')) return;
    void writeMsuManifest(pack, withSoundGroup(saveBase, channel, soundId, wanted)).then(onSaved);
  };

  return (
    <Box className="msu-sound-group">
      <Field label={t('msu-studio:sound.group.label')} hint={t('msu-studio:sound.group.hint')}>
        <TextInput
          type="text"
          placeholder={t('msu-studio:sound.group.placeholder')}
          value={draft}
          disabled={disabled}
          onChange={(event) => setDraft(event.target.value)}
          onBlur={commit}
          onKeyDown={(event) => { if (event.key === 'Enter') event.currentTarget.blur(); }}
        />
      </Field>
    </Box>
  );
};

export { SoundGroupField };
