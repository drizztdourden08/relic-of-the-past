/* @layer renderer-components @kind component */
﻿import { useState } from 'react';
import { Button } from '../../../../design-system/primitives/Button';
import { TextInput } from '../../../../design-system/primitives/TextInput';
import { NativeSelect } from '../../../../design-system/primitives/Select';
import './CreateProfileForm.css';
import { type CreateProfileFormProps } from './types';


const CreateProfileForm = (props: CreateProfileFormProps) => {
  const { readyRoms, onCreate, onCancel } = props;
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
};

export {
  CreateProfileForm,
};
