/* @layer renderer-widgets @kind component */
/** ScreenEditor step-1 bottom: identity/metadata + optional variant condition. */
import { Button, Select, TagPicker } from '../../../components/primitives';
import type { VariantCondition } from '@shared/game/types';
import { CONDITION_TYPE_OPTIONS, TAG_GROUPS } from './screen-editor-constants';
import type { ScreenEditor } from './useScreenEditor';

const ScreenEditorFieldsBottom = ({ editor }: { editor: ScreenEditor }) => {
  const {
    name, setName, creatingArea, setCreatingArea, areaOptions, areaId, setAreaId, setLocationId,
    newAreaName, setNewAreaName, handleCreateArea, isDungeonLocked, resolvedLocation,
    creatingLocation, setCreatingLocation, locationOptions, locationId, newLocationName, setNewLocationName,
    handleCreateLocation, type, entranceId, setEntranceId, selectedTags, setSelectedTags,
    hasVariant, setHasVariant, variantKey, setVariantKey, variantLabel, setVariantLabel,
    conditionType, setConditionType, condCheckName, setCondCheckName, condCheckCollected, setCondCheckCollected,
    condFlagAddr, setCondFlagAddr, condFlagBit, setCondFlagBit, condFlagValue, setCondFlagValue,
    condEntranceId, setCondEntranceId, condProgressMin, setCondProgressMin, condProgressMax, setCondProgressMax,
  } = editor;
  return (
    <>
      {/* ── Section 3: Identity & Metadata ── */}
      <div className="screen-editor__section">
        <div className="screen-editor__row">
          <label>Name</label>
          <input className="text-input" value={name} onChange={e => setName(e.target.value)} placeholder="Screen name" />
        </div>

        {/* Area — editable for all types (dungeon defaults from meta) */}
        <div className="screen-editor__row">
          <label>Area</label>
          {!creatingArea ? (
            <div className="screen-editor__select-with-action">
              <Select
                options={areaOptions}
                value={areaId}
                onChange={v => {
                  if (v === '__new__') { setCreatingArea(true); setNewAreaName(''); }
                  else { setAreaId(v); setLocationId(''); }
                }}
                placeholder="Select area..."
                searchable
              />
            </div>
          ) : (
            <div className="screen-editor__inline-create">
              <input className="text-input" value={newAreaName} onChange={e => setNewAreaName(e.target.value)} placeholder="New area name" autoFocus />
              <Button variant="primary" onClick={handleCreateArea} disabled={!newAreaName.trim()}>Add</Button>
              <Button variant="secondary" onClick={() => setCreatingArea(false)}>Cancel</Button>
            </div>
          )}
        </div>

        {/* Location — locked for dungeon, editable for interior/overworld */}
        {isDungeonLocked ? (
          <div className="screen-editor__row screen-editor__row--locked">
            <label>Location</label>
            <span className="screen-editor__locked-value">{resolvedLocation}</span>
          </div>
        ) : (
          <div className="screen-editor__row">
            <label>Location</label>
            {!creatingLocation ? (
              <div className="screen-editor__select-with-action">
                <Select
                  options={locationOptions}
                  value={locationId}
                  onChange={v => {
                    if (v === '__new__') { setCreatingLocation(true); setNewLocationName(''); }
                    else { setLocationId(v); }
                  }}
                  placeholder="Select location..."
                  searchable
                />
              </div>
            ) : (
              <div className="screen-editor__inline-create">
                <input className="text-input" value={newLocationName} onChange={e => setNewLocationName(e.target.value)} placeholder="New location name" autoFocus />
                <Button variant="primary" onClick={handleCreateLocation} disabled={!newLocationName.trim() || !areaId}>Add</Button>
                <Button variant="secondary" onClick={() => setCreatingLocation(false)}>Cancel</Button>
              </div>
            )}
          </div>
        )}

        {type === 'interior' && (
          <div className="screen-editor__row">
            <label>Entrance ID</label>
            <input className="text-input" value={entranceId} onChange={e => setEntranceId(e.target.value)} placeholder="Optional hex — disambiguates shared rooms" />
          </div>
        )}
        <TagPicker
          label="Tags"
          groups={TAG_GROUPS}
          value={selectedTags}
          onChange={setSelectedTags}
        />
      </div>

      {/* ── Section 4: Variant (optional) ── */}
      <div className="screen-editor__section">
        <div className="screen-editor__row">
          <label>
            <input type="checkbox" checked={hasVariant} onChange={e => setHasVariant(e.target.checked)} />
            {' '}Has Variant
          </label>
        </div>
        {hasVariant && (
          <>
            <div className="screen-editor__row screen-editor__row--half">
              <div>
                <label>Key</label>
                <input className="text-input" value={variantKey} onChange={e => setVariantKey(e.target.value)} placeholder="e.g. intro" />
              </div>
              <div>
                <label>Label (optional)</label>
                <input className="text-input" value={variantLabel} onChange={e => setVariantLabel(e.target.value)} placeholder="Display label" />
              </div>
            </div>
            <div className="screen-editor__row">
              <label>Condition</label>
              <Select
                options={CONDITION_TYPE_OPTIONS}
                value={conditionType}
                onChange={v => setConditionType(v as VariantCondition['type'])}
              />
            </div>
            {conditionType === 'check' && (
              <div className="screen-editor__row screen-editor__row--half">
                <div>
                  <label>Check Name</label>
                  <input className="text-input" value={condCheckName} onChange={e => setCondCheckName(e.target.value)} placeholder="e.g. Link's Uncle" />
                </div>
                <div>
                  <label>
                    <input type="checkbox" checked={condCheckCollected} onChange={e => setCondCheckCollected(e.target.checked)} />
                    {' '}Collected
                  </label>
                </div>
              </div>
            )}
            {conditionType === 'flag' && (
              <div className="screen-editor__row screen-editor__row--half">
                <div>
                  <label>WRAM Address</label>
                  <input className="text-input" value={condFlagAddr} onChange={e => setCondFlagAddr(e.target.value)} placeholder="0x7EF..." />
                </div>
                <div>
                  <label>Bit</label>
                  <input className="text-input" value={condFlagBit} onChange={e => setCondFlagBit(e.target.value)} placeholder="0-7" />
                </div>
                <div>
                  <label>
                    <input type="checkbox" checked={condFlagValue} onChange={e => setCondFlagValue(e.target.checked)} />
                    {' '}Value (set)
                  </label>
                </div>
              </div>
            )}
            {conditionType === 'entrance' && (
              <div className="screen-editor__row">
                <label>Entrance ID</label>
                <input className="text-input" value={condEntranceId} onChange={e => setCondEntranceId(e.target.value)} placeholder="Entrance ID to match" />
              </div>
            )}
            {conditionType === 'progress' && (
              <div className="screen-editor__row screen-editor__row--half">
                <div>
                  <label>Min Tier</label>
                  <input className="text-input" value={condProgressMin} onChange={e => setCondProgressMin(e.target.value)} placeholder="Optional" />
                </div>
                <div>
                  <label>Max Tier</label>
                  <input className="text-input" value={condProgressMax} onChange={e => setCondProgressMax(e.target.value)} placeholder="Optional" />
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </>
  );
};

export { ScreenEditorFieldsBottom };
