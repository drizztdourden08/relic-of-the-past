/* @layer renderer-widgets @kind component */
/** ScreenEditor step-1 top: classification (type/world) + type-specific detail panel. */
import { Box, Field, Text, Select, SegmentedControl, TextInput } from '../../../../design-system/primitives';
import type { InteriorKind } from '@shared/game/data';
import { TYPE_SEGMENTS, WORLD_SEGMENTS, PALACE_OPTIONS, INTERIOR_KIND_OPTIONS } from './screen-editor-constants';
import { LockedValue } from './LockedValue';
import type { ScreenEditor } from './useScreenEditor';

const ScreenEditorFieldsTop = ({ editor }: { editor: ScreenEditor }) => {
  const {
    kind, setKind, world, setWorld, dungeonGeography, effectiveWorld,
    palaceIdx, handlePalaceChange, floor, setFloor, gridX, setGridX, gridY, setGridY,
    interiorKind, setInteriorKind, effectiveGridX, effectiveGridY,
  } = editor;
  return (
    <>
      {/* ── Section 1: Classification ── */}
      <Box className="screen-editor__section">
        <SegmentedControl
          label="Type"
          value={kind}
          options={TYPE_SEGMENTS}
          onChange={setKind}
        />
        {/* World — locked for a dungeon (its rooms decide) and for the overworld (its index decides) */}
        {kind === 'interior' ? (
          <SegmentedControl
            label="World"
            value={world}
            options={WORLD_SEGMENTS}
            onChange={setWorld}
          />
        ) : (
          <Field className="screen-editor__row screen-editor__row--locked" label="World">
            <LockedValue>
              {effectiveWorld === 'light' ? 'Light World' : 'Dark World'}
            </LockedValue>
          </Field>
        )}
      </Box>

      {/* ── Section 2: Type-specific panel ── */}
      <Box className="screen-editor__panel">
        <Text className="screen-editor__panel-label">
          {kind === 'dungeon' ? 'Dungeon' : kind === 'overworld' ? 'Overworld' : 'Interior'} Details
        </Text>

        {kind === 'dungeon' && (
          <>
            <Field className="screen-editor__row" label="Palace Index">
              <Select options={PALACE_OPTIONS} value={palaceIdx} onChange={handlePalaceChange} placeholder="Select palace..." searchable />
            </Field>
            {dungeonGeography && (
              <Field className="screen-editor__row screen-editor__row--locked" label="Dungeon">
                <LockedValue>{dungeonGeography.randomizerName}</LockedValue>
              </Field>
            )}
            <Box className="screen-editor__row screen-editor__row--half">
              <Field label="Floor">
                <TextInput value={floor} onChange={e => setFloor(e.target.value)} placeholder="-1, 0, 1..." />
              </Field>
              <Field label="Grid X, Y">
                <Box className="screen-editor__grid-pair">
                  <TextInput value={gridX} onChange={e => setGridX(e.target.value)} placeholder="X" />
                  <TextInput value={gridY} onChange={e => setGridY(e.target.value)} placeholder="Y" />
                </Box>
              </Field>
            </Box>
          </>
        )}

        {kind === 'interior' && (
          <Field className="screen-editor__row" label="Interior Kind">
            <Select options={INTERIOR_KIND_OPTIONS} value={interiorKind} onChange={v => setInteriorKind(v as InteriorKind)} />
          </Field>
        )}

        {kind === 'overworld' && (
          <Box className="screen-editor__row screen-editor__row--half">
            <Field className="screen-editor__row--locked" label="Grid X">
              <LockedValue>{effectiveGridX}</LockedValue>
            </Field>
            <Field className="screen-editor__row--locked" label="Grid Y">
              <LockedValue>{effectiveGridY}</LockedValue>
            </Field>
          </Box>
        )}
      </Box>
    </>
  );
};

export { ScreenEditorFieldsTop };
