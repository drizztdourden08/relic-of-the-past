/* @layer renderer-components @kind component */
import { useState } from 'react';
import { Box, Icon, IconButton, TextInput, NumberInput } from '@drizztdourden08/tessera/primitives';
import { useShadowEditorStore } from '../../../../stores/shadow-editor-store';
import './HeightLevelEditor.css';

const HeightLevelEditor = () => {
  const { heightLevels, addHeightLevel, removeHeightLevel, updateHeightLevel } = useShadowEditorStore();
  const [newLabel, setNewLabel] = useState('');
  const [newValue, setNewValue] = useState('0.5');

  const handleAdd = () => {
    const val = parseFloat(newValue);
    if (isNaN(val) || val < 0 || val > 1) return;
    const label = newLabel.trim() || `H${Math.round(val * 100)}`;
    addHeightLevel(label, val);
    setNewLabel('');
    setNewValue('0.5');
  };

  return (
    <Box className="height-level-editor">
      <Box className="height-level-editor__list">
        {heightLevels.map((level, i) => (
          <Box key={i} className="height-level-editor__item">
            <Box
              className="height-level-editor__swatch"
              style={{ opacity: level.value }}
            />
            <TextInput
              className="height-level-editor__name"
              value={level.label}
              onChange={(e) => updateHeightLevel(i, { label: e.target.value })}
            />
            <NumberInput
              className="height-level-editor__value"
              value={level.value}
              min={0}
              max={1}
              step={0.05}
              onChange={(v) => {
                if (!isNaN(v)) updateHeightLevel(i, { value: Math.min(1, Math.max(0, v)) });
              }}
            />
            <IconButton variant="ghost" tone="danger" size="xs" label="Remove" onClick={() => removeHeightLevel(i)}>
              <Icon name="x" />
            </IconButton>
          </Box>
        ))}
      </Box>
      <Box className="height-level-editor__add">
        <TextInput
          className="height-level-editor__name"
          placeholder="Label"
          value={newLabel}
          onChange={(e) => setNewLabel(e.target.value)}
        />
        <TextInput
          className="height-level-editor__value"
          type="number"
          placeholder="0.5"
          value={newValue}
          min={0}
          max={1}
          step={0.05}
          onChange={(e) => setNewValue(e.target.value)}
        />
        <IconButton variant="ghost" size="xs" label="Add level" onClick={handleAdd}>
          <Icon name="plus" />
        </IconButton>
      </Box>
    </Box>
  );
};

export { HeightLevelEditor };
