/* @layer renderer-app @kind component */
/**
 * The editor tab of a comparison pane.
 *
 * It is `RecordEditor` with the same lookups the normal editor injects, minus
 * the two capabilities that would write to the dataset from inside a review:
 * there is no delete guard (nothing here deletes) and no tag creator (minting a
 * vocabulary term is a record write, and a proposal has not been accepted yet).
 * `onCommit` is what makes a pane editable at all — omitted, every control
 * renders disabled, which is exactly what the current side wants.
 *
 * Saving here commits to the reviewer's DRAFT, not to disk. The dataset write
 * happens once, on Accept.
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
  /** Omitted, the form is a reader — which is what the current side is. */
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
