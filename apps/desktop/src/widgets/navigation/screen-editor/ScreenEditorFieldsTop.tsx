/* @layer renderer-widgets @kind component */
/** ScreenEditor step-1 top: classification (type/world) + type-specific detail panel. */
import { Select, SegmentedControl, TextInput } from '../../../components/primitives';
import type { InteriorKind } from '@shared/game/types';
import { TYPE_SEGMENTS, WORLD_SEGMENTS, PALACE_OPTIONS, INTERIOR_KIND_OPTIONS } from './screen-editor-constants';
import type { ScreenEditor } from './useScreenEditor';

const ScreenEditorFieldsTop = ({ editor }: { editor: ScreenEditor }) => {
  const {
    type, setType, world, setWorld, isDungeonLocked, dungeonMeta, overworldDerived,
    palaceIdx, handlePalaceChange, dungeonName, floor, setFloor, gridX, setGridX, gridY, setGridY,
    interiorKind, setInteriorKind, effectiveGridX, effectiveGridY,
  } = editor;
  return (
    <>
      {/* ── Section 1: Classification ── */}
      <div className="screen-editor__section">
        <SegmentedControl
          label="Type"
          value={type}
          options={TYPE_SEGMENTS}
          onChange={setType}
        />
        {/* World — locked for dungeon (derived from meta) and overworld (derived from roomIndex) */}
        {type === 'interior' ? (
          <SegmentedControl
            label="World"
            value={world}
            options={WORLD_SEGMENTS}
            onChange={setWorld}
          />
        ) : (
          <div className="screen-editor__row screen-editor__row--locked">
            <label>World</label>
            <span className="screen-editor__locked-value">
              {(isDungeonLocked ? dungeonMeta!.world : overworldDerived?.world ?? world) === 'light' ? 'Light World' : 'Dark World'}
            </span>
          </div>
        )}
      </div>

      {/* ── Section 2: Type-specific panel ── */}
      <div className="screen-editor__panel">
        <span className="screen-editor__panel-label">
          {type === 'dungeon' ? 'Dungeon' : type === 'overworld' ? 'Overworld' : 'Interior'} Details
        </span>

        {type === 'dungeon' && (
          <>
            <div className="screen-editor__row">
              <label>Palace Index</label>
              <Select options={PALACE_OPTIONS} value={palaceIdx} onChange={handlePalaceChange} placeholder="Select palace..." searchable />
            </div>
            {dungeonName && (
              <div className="screen-editor__row screen-editor__row--locked">
                <label>Dungeon</label>
                <span className="screen-editor__locked-value">{dungeonName}</span>
              </div>
            )}
            <div className="screen-editor__row screen-editor__row--half">
              <div>
                <label>Floor</label>
                <TextInput value={floor} onChange={e => setFloor(e.target.value)} placeholder="-1, 0, 1..." />
              </div>
              <div>
                <label>Grid X, Y</label>
                <div style={{ display: 'flex', gap: '4px' }}>
                  <TextInput value={gridX} onChange={e => setGridX(e.target.value)} placeholder="X" />
                  <TextInput value={gridY} onChange={e => setGridY(e.target.value)} placeholder="Y" />
                </div>
              </div>
            </div>
          </>
        )}

        {type === 'interior' && (
          <div className="screen-editor__row">
            <label>Interior Kind</label>
            <Select options={INTERIOR_KIND_OPTIONS} value={interiorKind} onChange={v => setInteriorKind(v as InteriorKind)} />
          </div>
        )}

        {type === 'overworld' && (
          <div className="screen-editor__row screen-editor__row--half">
            <div className="screen-editor__row--locked">
              <label>Grid X</label>
              <span className="screen-editor__locked-value">{effectiveGridX}</span>
            </div>
            <div className="screen-editor__row--locked">
              <label>Grid Y</label>
              <span className="screen-editor__locked-value">{effectiveGridY}</span>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export { ScreenEditorFieldsTop };
