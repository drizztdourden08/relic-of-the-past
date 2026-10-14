/* @layer renderer-app @kind component */
import { RecordEditor } from '@drizztdourden08/tessera/composites';
import { resolveIdRefOptionsFor } from '@app/views/DataInspector/behavior/id-ref-options';
import { numberBoundsResolverFor } from '@app/data-inspector/number-bounds';
import { tagSuggestionsResolverFor } from '@app/data-inspector/tag-suggestions';
import type { ProposalFormProps } from '../RecommendationDetail.type';

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
