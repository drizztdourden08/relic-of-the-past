/* @layer renderer-components @kind component */
/** The "+ Add filter" control. Reuses DataTable's FieldPicker; this button decides where it floats. */
import { Box } from '../../../primitives/Box';
import { Button } from '../../../primitives/Button';
import { Portal, useAnchorTracking } from '../../../primitives/Portal';
import { toSchemaIndex } from '../../../data/schema/build-schema';
import { createClauseForField } from '../behavior/filter-clause-defaults';
import { useAnchorMenu } from '../behavior/use-anchor-menu';
import { FieldPicker } from '../../DataTable';
import type { SchemaLike } from '../../../data/schema/build-schema';
import type { FilterClause } from '../../../data/filter/clause';
import '../FilterBar.css';

interface AddFilterButtonProps {
  schema: SchemaLike;
  /** Paths already carrying a clause. FieldPicker keeps them out of the tree. */
  excludePaths?: readonly string[];
  onAdd: (clause: FilterClause) => void;
}

const AddFilterButton = (props: AddFilterButtonProps) => {
  const { schema, excludePaths, onAdd } = props;
  const menu = useAnchorMenu<HTMLButtonElement>('.filter-bar__add-picker');
  const index = toSchemaIndex(schema);

  // Portalled in viewport coordinates, so it is re-measured as the bar scrolls
  // and dismissed once the button is gone.
  const { position: pos } = useAnchorTracking({
    active: menu.open,
    anchorRef: menu.anchorRef,
    compute: (rect) => ({ top: rect.bottom, left: rect.left }),
    onOutOfView: menu.close,
  });

  const handlePick = (path: string): void => {
    const field = index.byPath(path);
    if (!field) return;
    onAdd(createClauseForField(field));
    menu.close();
  };

  return (
    <>
      <Button
        ref={menu.anchorRef}
        variant="tertiary"
        size="sm"
        className="filter-bar__add"
        aria-haspopup="menu"
        aria-expanded={menu.open}
        onClick={menu.toggle}
      >
        ＋ Add filter
      </Button>
      {menu.open && (
        <Portal layer="overlay">
          <Box
            className="filter-bar__add-picker"
            style={pos ? { position: 'fixed', top: pos.top, left: pos.left } : undefined}
          >
            <FieldPicker schema={index.roots()} excludePaths={excludePaths} onPick={handlePick} />
          </Box>
        </Portal>
      )}
    </>
  );
};

export { AddFilterButton };
export type { AddFilterButtonProps };
