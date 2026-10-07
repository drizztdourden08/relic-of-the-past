/* @layer renderer-components @kind component */
/**
 * An `array` of `idRef` elements, read one chip per entry. This is the array
 * kit's counterpart to the single-value `idRef` cell. `summarizeList` flattens
 * everything else to one line of raw values, but a list of references is a list
 * of records, and each one deserves its own resolved name, its own
 * `data-id-ref`/`data-target-kind` handoff, and the same `"Name (id)"` format
 * `formatIdRefDisplay` already gives the single-value case, reused here per
 * entry instead of re-derived.
 *
 * `Badge` is this design system's existing chip: `array-kit`'s own count
 * summary already reaches for it, so a list of resolved references reads as
 * more of the same instead of a third visual convention.
 */
import { Badge } from '../../../primitives/Badge';
import { Flex } from '../../../primitives/Flex';
import { toText } from '../coerce';
import { formatIdRefDisplay } from '../id-ref-format';
import type { ArrayIdRefResolver } from '../registry';

interface IdRefBadgeListProps {
  list: readonly unknown[];
  targetKind?: string;
  resolveIdRefDisplay?: ArrayIdRefResolver;
}

const IdRefBadgeList = (props: IdRefBadgeListProps) => {
  const { list, targetKind, resolveIdRefDisplay } = props;

  return (
    <Flex gap="xs" wrap className="field-kit__ref-list">
      {list.map((entry, index) => {
        const id = toText(entry).trim();
        if (!id) return null;
        const display = formatIdRefDisplay(id, resolveIdRefDisplay?.(id, targetKind));
        return (
          <Badge
            key={`${id}-${index}`}
            variant="neutral"
            className="field-kit__ref-chip"
            title={targetKind ? `${targetKind}: ${id}` : id}
            data-id-ref={id}
            data-target-kind={targetKind}
          >
            {display}
          </Badge>
        );
      })}
    </Flex>
  );
};

export { IdRefBadgeList };
