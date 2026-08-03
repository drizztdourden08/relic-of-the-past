/* @layer renderer-components @kind component */
/**
 * A form derived from a schema, for one record.
 *
 * Layout is automatic and the config only adjusts it: with no config the whole
 * schema lays out as one set in schema order, and with `groups` each configured
 * fieldset appears in its configured order with anything left over behind them.
 *
 * `onSave` decides the mode. Without it the editor is a reader — every control
 * still renders, all of them disabled, and there is no save button to imply
 * otherwise. With it, the button unlocks the moment the working copy differs
 * from the record and reports what the promise did.
 */
import { useCallback, useMemo } from 'react';
import { Box } from '../../primitives/Box';
import { Button } from '../../primitives/Button';
import { Flex } from '../../primitives/Flex';
import { Text } from '../../primitives/Text';
import { getPath } from '../../data/schema/path';
import { markedPaths } from './behavior/changed-paths';
import { useRecordEditorState } from './behavior/use-record-editor-state';
import { layoutGroups } from './behavior/layout-groups';
import { EditorGroup } from './sub-components/EditorGroup';
import { ReferencedBy } from './sub-components/ReferencedBy';
import type { EditorBinding, RecordEditorProps } from './RecordEditor.type';
import './RecordEditor.css';

const SAVE = 'Save';
const SAVING = 'Saving…';
const REVERT = 'Revert';
const DELETE = 'Delete';
const NO_FIELDS = 'This record has no fields to show.';

const RecordEditor = <T,>(props: RecordEditorProps<T>) => {
  const {
    record, schema, config, onSave, disabled = false, changedPaths,
    resolveIdRefOptions, resolveTagSuggestions, onCreateTag, resolveNumberBounds,
    referencedBy, onDelete,
  } = props;
  const { working, isDirty, isPathDirty, saving, saveError, setValue, revert, handleSave } =
    useRecordEditorState({ record, onSave });

  const groups = useMemo(() => layoutGroups(schema, config), [schema, config]);
  const readOnly = onSave === undefined || disabled;
  const readValue = useCallback((path: string) => getPath(working, path), [working]);

  // Bounds close over the working copy here, so a row never has to carry the
  // record around to ask a question about one of its own fields.
  const readBounds = useCallback(
    (path: string) => resolveNumberBounds?.(path, working),
    [resolveNumberBounds, working],
  );

  // Closed over once per changed-path list rather than re-derived per row —
  // see markedPaths for why a container counts as changed too.
  const changed = useMemo(() => (changedPaths ? markedPaths(changedPaths) : null), [changedPaths]);
  const isChanged = useCallback((path: string) => changed?.has(path) ?? false, [changed]);

  const binding = useMemo<EditorBinding>(
    () => ({
      value: readValue,
      onChange: setValue,
      isDirty: isPathDirty,
      isChanged: changed ? isChanged : undefined,
      disabled: readOnly,
      resolveIdRefOptions,
      resolveTagSuggestions,
      onCreateTag,
      bounds: readBounds,
    }),
    [readValue, setValue, isPathDirty, changed, isChanged, readOnly, resolveIdRefOptions,
      resolveTagSuggestions, onCreateTag, readBounds],
  );

  return (
    <Box className="record-editor">
      {groups.length === 0 && <Text className="record-editor__empty">{NO_FIELDS}</Text>}
      {groups.map((group) => (
        <EditorGroup key={group.id} group={group} binding={binding} depth={0} />
      ))}
      {referencedBy !== undefined && <ReferencedBy hits={referencedBy} />}
      {(onSave !== undefined || onDelete !== undefined) && (
        <Flex className="record-editor__footer" gap="sm" align="center" justify="end">
          {saveError != null && (
            <Text as="p" className="record-editor__error">{saveError}</Text>
          )}
          {onDelete !== undefined && (
            <Button variant="danger" disabled={disabled} onClick={onDelete}>
              {DELETE}
            </Button>
          )}
          {onSave !== undefined && (
            <>
              <Button variant="tertiary" disabled={!isDirty || saving || disabled} onClick={revert}>
                {REVERT}
              </Button>
              <Button variant="primary" disabled={!isDirty || saving || disabled} onClick={handleSave}>
                {saving ? SAVING : SAVE}
              </Button>
            </>
          )}
        </Flex>
      )}
    </Box>
  );
};

export { RecordEditor };
