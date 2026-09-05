/* @layer renderer-app @kind component */
/**
 * The editor tab of a comparison pane: `RecordEditor` with the normal lookups
 * minus the two that would write to the dataset mid-review (no delete guard,
 * no tag creator). Without `onCommit` every control renders disabled, which is
 * what the current side wants. Saving commits to the reviewer's draft, not to
 * disk; the dataset write happens once, on Accept.
 */
import { RecordEditor } from '@ds/composites';
import { resolveIdRefOptionsFor } from '../../behavior/id-ref-options';
import { numberBoundsResolverFor } from '../../behavior/number-bounds';
import { tagSuggestionsResolverFor } from '../../behavior/tag-suggestions';
import type { EntityKind } from '@shared/game/data';
import type { FieldDescriptor, SchemaConfig } from '@ds/data';
import type { InspectorRow } from '../../DataInspector.type';

interface ProposalFormProps {
  kind: EntityKind;
  schema: readonly FieldDescriptor[];
  config?: SchemaConfig;
  record: InspectorRow;
  /** Where the proposal differs from what the dataset holds. */
  changedPaths: readonly string[];
  /** Omitted when the form is a reader, which is what the current side is. */
  onCommit?: (next: InspectorRow) => Promise<void>;
}

const ProposalForm = (props: ProposalFormProps) => {
  const { kind, schema, config, record, changedPaths, onCommit } = props;

  return (
    <RecordEditor
      record={record}
      schema={schema}
      config={config}
      changedPaths={changedPaths}
      onSave={onCommit}
      resolveIdRefOptions={resolveIdRefOptionsFor}
      resolveTagSuggestions={tagSuggestionsResolverFor(kind)}
      resolveNumberBounds={numberBoundsResolverFor(kind)}
    />
  );
};

export { ProposalForm };
export type { ProposalFormProps };
