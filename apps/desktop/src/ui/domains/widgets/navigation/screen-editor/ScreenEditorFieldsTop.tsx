/* @layer renderer-widgets @kind component */
/** ScreenEditor step-1 top: classification (type/world) + type-specific detail panel. */
import { Box, Text, Select, SegmentedControl, TextInput } from '../../../../design-system/primitives';
import type { InteriorKind } from '@shared/game/types';
import { TYPE_SEGMENTS, WORLD_SEGMENTS, PALACE_OPTIONS, INTERIOR_KIND_OPTIONS } from './screen-editor-constants';
import { EditorField } from './EditorField';
import { LockedValue } from './LockedValue';
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
      <Box className="screen-editor__section">
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
          <EditorField className="screen-editor__row screen-editor__row--locked" label="World">
            <LockedValue>
              {(isDungeonLocked ? dungeonMeta!.world : overworldDerived?.world ?? world) === 'light' ? 'Light World' : 'Dark World'}
            </LockedValue>
          </EditorField>
        )}
      </Box>

      {/* ── Section 2: Type-specific panel ── */}
      <Box className="screen-editor__panel">
        <Text className="screen-editor__panel-label">
          {type === 'dungeon' ? 'Dungeon' : type === 'overworld' ? 'Overworld' : 'Interior'} Details
        </Text>

        {type === 'dungeon' && (
          <>
            <EditorField className="screen-editor__row" label="Palace Index">
              <Select options={PALACE_OPTIONS} value={palaceIdx} onChange={handlePalaceChange} placeholder="Select palace..." searchable />
            </EditorField>
            {dungeonName && (
              <EditorField className="screen-editor__row screen-editor__row--locked" label="Dungeon">
                <LockedValue>{dungeonName}</LockedValue>
              </EditorField>
            )}
            <Box className="screen-editor__row screen-editor__row--half">
              <EditorField label="Floor">
                <TextInput value={floor} onChange={e => setFloor(e.target.value)} placeholder="-1, 0, 1..." />
              </EditorField>
              <EditorField label="Grid X, Y">
                <Box style={{ display: 'flex', gap: '4px' }}>
                  <TextInput value={gridX} onChange={e => setGridX(e.target.value)} placeholder="X" />
                  <TextInput value={gridY} onChange={e => setGridY(e.target.value)} placeholder="Y" />
                </Box>
              </EditorField>
            </Box>
          </>
        )}

        {type === 'interior' && (
          <EditorField className="screen-editor__row" label="Interior Kind">
            <Select options={INTERIOR_KIND_OPTIONS} value={interiorKind} onChange={v => setInteriorKind(v as InteriorKind)} />
          </EditorField>
        )}

        {type === 'overworld' && (
          <Box className="screen-editor__row screen-editor__row--half">
            <EditorField className="screen-editor__row--locked" label="Grid X">
              <LockedValue>{effectiveGridX}</LockedValue>
            </EditorField>
            <EditorField className="screen-editor__row--locked" label="Grid Y">
              <LockedValue>{effectiveGridY}</LockedValue>
            </EditorField>
          </Box>
        )}
      </Box>
    </>
  );
};

export { ScreenEditorFieldsTop };
