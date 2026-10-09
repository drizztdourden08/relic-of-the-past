/* @layer renderer-components @kind component */
import { useEffect, useState } from 'react';
import { Box } from '@ds/primitives/Box';
import { Field } from '@ds/primitives/Field';
import { TextInput } from '@ds/primitives/TextInput';
import { writeMsuManifest } from '@app/lib/storage/msu-store';
import { withSoundGroup } from './behavior/sound-manifest';
import { HINT } from './SoundGroupField.constants';
import type { SoundGroupFieldProps } from './SoundGroupField.type';

const SoundGroupField = (props: SoundGroupFieldProps) => {
  const { pack, channel, soundId, group, saveBase, disabled = false, onSaved } = props;
  const [draft, setDraft] = useState(group ?? '');

  useEffect(() => { setDraft(group ?? ''); }, [group]);

  const commit = (): void => {
    const wanted = draft.trim();
    if (wanted === (group ?? '')) return;
    void writeMsuManifest(pack, withSoundGroup(saveBase, channel, soundId, wanted)).then(onSaved);
  };

  return (
    <Box className="msu-sound-group">
      <Field label="Continuity group" hint={HINT}>
        <TextInput
          type="text"
          placeholder="storm..."
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
