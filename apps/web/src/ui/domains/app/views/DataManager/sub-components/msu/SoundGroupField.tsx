/* @layer renderer-components @kind component */
/**
 * Continuity group: a free-text name, not a toggle, because the relation is BETWEEN sounds. Saves
 * on blur straight into the manifest; it is sound-level, so it cannot ride the layer editor's save.
 */
import { useEffect, useState } from 'react';
import type { MsuPackManifest, SoundChannel } from '@shared/types/msu-manifest';
import { Box } from '@ds/primitives/Box';
import { Field } from '@ds/primitives/Field';
import { TextInput } from '@ds/primitives/TextInput';
import { writeMsuManifest } from '@app/lib/storage/msu-store';
import { withSoundGroup } from './behavior/sound-manifest';

interface SoundGroupFieldProps {
  pack: string;
  channel: SoundChannel;
  soundId: number;
  /** The group as saved. The field re-syncs when it changes underneath. */
  group: string | undefined;
  /** What a save WRITES into. Absent for a pack that cannot hold one. */
  saveBase: MsuPackManifest;
  disabled?: boolean;
  onSaved: () => void;
}

const HINT = 'Sounds sharing a group continue into each other without a break: layers with the same files'
  + ' and timing carry their position across, and only what differs changes. Leave empty for none.';

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
export type { SoundGroupFieldProps };
