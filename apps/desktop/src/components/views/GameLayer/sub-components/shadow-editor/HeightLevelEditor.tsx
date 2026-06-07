/* @layer renderer-components @kind component */
import { useState } from 'react';
import { useShadowEditorStore } from '../../../../../stores/shadow-editor-store';
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
    <div className="height-level-editor">
      <div className="height-level-editor__list">
        {heightLevels.map((level, i) => (
          <div key={i} className="height-level-editor__item">
            <span
              className="height-level-editor__swatch"
              style={{ opacity: level.value }}
            />
            <input
              className="height-level-editor__name"
              value={level.label}
              onChange={(e) => updateHeightLevel(i, { label: e.target.value })}
            />
            <input
              className="height-level-editor__value"
              type="number"
              value={level.value}
              min={0}
              max={1}
              step={0.05}
              onChange={(e) => {
                const v = parseFloat(e.target.value);
                if (!isNaN(v)) updateHeightLevel(i, { value: Math.min(1, Math.max(0, v)) });
              }}
            />
            <button
              type="button"
              className="height-level-editor__remove"
              onClick={() => removeHeightLevel(i)}
              title="Remove"
            >
              ✕
            </button>
          </div>
        ))}
      </div>
      <div className="height-level-editor__add">
        <input
          className="height-level-editor__name"
          placeholder="Label"
          value={newLabel}
          onChange={(e) => setNewLabel(e.target.value)}
        />
        <input
          className="height-level-editor__value"
          type="number"
          placeholder="0.5"
          value={newValue}
          min={0}
          max={1}
          step={0.05}
          onChange={(e) => setNewValue(e.target.value)}
        />
        <button
          type="button"
          className="height-level-editor__add-btn"
          onClick={handleAdd}
          title="Add level"
        >
          +
        </button>
      </div>
    </div>
  );
};

export { HeightLevelEditor };
