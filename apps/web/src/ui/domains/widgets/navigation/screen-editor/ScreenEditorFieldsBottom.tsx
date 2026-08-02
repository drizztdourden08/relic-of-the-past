/* @layer renderer-widgets @kind component */
/** ScreenEditor step-1 bottom: identity/metadata + optional variant condition. */
import { Box, Button, Field, Select, TagPicker, TextInput, Checkbox } from '../../../../design-system/primitives';
import type { AreaId, LocationId, VariantCondition } from '@shared/game/data';
import { CONDITION_TYPE_OPTIONS, TAG_GROUPS } from './screen-editor-constants';
import { LockedValue } from './LockedValue';
import type { ScreenEditor } from './useScreenEditor';

const ScreenEditorFieldsBottom = ({ editor }: { editor: ScreenEditor }) => {
  const {
    randomizerName, setRandomizerName, creatingArea, setCreatingArea, areaOptions, areaId, setAreaId, setLocationId,
    newAreaName, setNewAreaName, handleCreateArea, isDungeonLocked, resolvedLocation,
    creatingLocation, setCreatingLocation, locationOptions, locationId, newLocationName, setNewLocationName,
    handleCreateLocation, kind, entranceId, setEntranceId, selectedTags, setSelectedTags,
    hasVariant, setHasVariant, variantKey, setVariantKey, variantLabel, setVariantLabel,
    conditionType, setConditionType, condCheckId, setCondCheckId, condCheckCollected, setCondCheckCollected,
    condFlagAddr, setCondFlagAddr, condFlagBit, setCondFlagBit, condFlagValue, setCondFlagValue,
    condEntranceId, setCondEntranceId, condProgressMin, setCondProgressMin, condProgressMax, setCondProgressMax,
    newOptionValue,
  } = editor;
  return (
    <>
      {/* ── Section 3: Identity & Metadata ── */}
      <Box className="screen-editor__section">
        <Field className="screen-editor__row" label="Name">
          <TextInput value={randomizerName} onChange={e => setRandomizerName(e.target.value)} placeholder="Screen name" />
        </Field>

        {/* Area — editable for all types (dungeon defaults from meta) */}
        <Field className="screen-editor__row" label="Area">
          {!creatingArea ? (
            <Box className="screen-editor__select-with-action">
              <Select
                options={areaOptions}
                value={areaId}
                onChange={v => {
                  if (v === newOptionValue) { setCreatingArea(true); setNewAreaName(''); }
                  else { setAreaId(v as AreaId); setLocationId(''); }
                }}
                placeholder="Select area..."
                searchable
              />
            </Box>
          ) : (
            <Box className="screen-editor__inline-create">
              <TextInput value={newAreaName} onChange={e => setNewAreaName(e.target.value)} placeholder="New area name" autoFocus />
              <Button variant="primary" onClick={handleCreateArea} disabled={!newAreaName.trim()}>Add</Button>
              <Button variant="tertiary" onClick={() => setCreatingArea(false)}>Cancel</Button>
            </Box>
          )}
        </Field>

        {/* Location — locked for dungeon, editable for interior/overworld */}
        {isDungeonLocked ? (
          <Field className="screen-editor__row screen-editor__row--locked" label="Location">
            <LockedValue>{resolvedLocation}</LockedValue>
          </Field>
        ) : (
          <Field className="screen-editor__row" label="Location">
            {!creatingLocation ? (
              <Box className="screen-editor__select-with-action">
                <Select
                  options={locationOptions}
                  value={locationId}
                  onChange={v => {
                    if (v === newOptionValue) { setCreatingLocation(true); setNewLocationName(''); }
                    else { setLocationId(v as LocationId); }
                  }}
                  placeholder="Select location..."
                  searchable
                />
              </Box>
            ) : (
              <Box className="screen-editor__inline-create">
                <TextInput value={newLocationName} onChange={e => setNewLocationName(e.target.value)} placeholder="New location name" autoFocus />
                <Button variant="primary" onClick={handleCreateLocation} disabled={!newLocationName.trim() || !areaId}>Add</Button>
                <Button variant="tertiary" onClick={() => setCreatingLocation(false)}>Cancel</Button>
              </Box>
            )}
          </Field>
        )}

        {kind === 'interior' && (
          <Field className="screen-editor__row" label="Entrance ID">
            <TextInput value={entranceId} onChange={e => setEntranceId(e.target.value)} placeholder="Optional hex — disambiguates shared rooms" />
          </Field>
        )}
        <TagPicker
          label="Tags"
          groups={TAG_GROUPS}
          value={selectedTags}
          onChange={setSelectedTags}
        />
      </Box>

      {/* ── Section 4: Variant (optional) ── */}
      <Box className="screen-editor__section">
        <Box className="screen-editor__row">
          <Checkbox checked={hasVariant} onChange={setHasVariant} label="Has Variant" />
        </Box>
        {hasVariant && (
          <>
            <Box className="screen-editor__row screen-editor__row--half">
              <Field label="Key">
                <TextInput value={variantKey} onChange={e => setVariantKey(e.target.value)} placeholder="e.g. intro" />
              </Field>
              <Field label="Label (optional)">
                <TextInput value={variantLabel} onChange={e => setVariantLabel(e.target.value)} placeholder="Display label" />
              </Field>
            </Box>
            <Field className="screen-editor__row" label="Condition">
              <Select
                options={CONDITION_TYPE_OPTIONS}
                value={conditionType}
                onChange={v => setConditionType(v as VariantCondition['type'])}
              />
            </Field>
            {conditionType === 'check' && (
              <Box className="screen-editor__row screen-editor__row--half">
                <Field label="Check Id">
                  <TextInput value={condCheckId} onChange={e => setCondCheckId(e.target.value)} placeholder="check-031" />
                </Field>
                <Box>
                  <Checkbox checked={condCheckCollected} onChange={setCondCheckCollected} label="Collected" />
                </Box>
              </Box>
            )}
            {conditionType === 'flag' && (
              <Box className="screen-editor__row screen-editor__row--half">
                <Field label="WRAM Address">
                  <TextInput value={condFlagAddr} onChange={e => setCondFlagAddr(e.target.value)} placeholder="0x7EF..." />
                </Field>
                <Field label="Bit">
                  <TextInput value={condFlagBit} onChange={e => setCondFlagBit(e.target.value)} placeholder="0-7" />
                </Field>
                <Box>
                  <Checkbox checked={condFlagValue} onChange={setCondFlagValue} label="Value (set)" />
                </Box>
              </Box>
            )}
            {conditionType === 'entrance' && (
              <Field className="screen-editor__row" label="Entrance ID">
                <TextInput value={condEntranceId} onChange={e => setCondEntranceId(e.target.value)} placeholder="Entrance ID to match" />
              </Field>
            )}
            {conditionType === 'progress' && (
              <Box className="screen-editor__row screen-editor__row--half">
                <Field label="Min Tier">
                  <TextInput value={condProgressMin} onChange={e => setCondProgressMin(e.target.value)} placeholder="Optional" />
                </Field>
                <Field label="Max Tier">
                  <TextInput value={condProgressMax} onChange={e => setCondProgressMax(e.target.value)} placeholder="Optional" />
                </Field>
              </Box>
            )}
          </>
        )}
      </Box>
    </>
  );
};

export { ScreenEditorFieldsBottom };
