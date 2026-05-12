import { useState } from 'react';
import { Button } from '../../primitives/Button';
import { TextInput } from '../../primitives/TextInput';
import { NativeSelect } from '../../primitives/Select';
import './CreateProfileForm.css';

interface CreateProfileFormProps {
  readyRoms: RomDisplayInfo[];
  onCreate: (name: string, romFile: string) => void;
  onCancel: () => void;
}

export function CreateProfileForm({
  readyRoms,
  onCreate,
  onCancel,
}: CreateProfileFormProps): JSX.Element {
  const [name, setName] = useState('');
  const [rom, setRom] = useState(readyRoms[0]?.romFile ?? '');

  const formatRomName = (romFile: string): string =>
    romFile.replace(/\.(sfc|smc)$/i, '');

  const handleSubmit = () => {
    if (!name.trim() || !rom) return;
    onCreate(name.trim(), rom);
  };

  return (
    <div className="create-profile-form">
      <TextInput
        type="text"
        placeholder="Profile name..."
        value={name}
        onChange={(e) => setName(e.target.value)}
        onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
        autoFocus
      />
      {readyRoms.length > 0 && (
        <NativeSelect value={rom} onChange={(e) => setRom(e.target.value)}>
          {readyRoms.map((r) => (
            <option key={r.romFile} value={r.romFile}>
              {formatRomName(r.romFile)}
            </option>
          ))}
        </NativeSelect>
      )}
      <div className="create-profile-form__actions">
        <Button variant="primary" onClick={handleSubmit}>Create</Button>
        <Button variant="secondary" onClick={onCancel}>Cancel</Button>
      </div>
    </div>
  );
}
